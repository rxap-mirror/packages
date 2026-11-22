import { HealthIndicatorService } from '@nestjs/terminus';
import { VaultHealthIndicator } from './vault.health-indicator';

describe('VaultHealthIndicator', () => {
  let indicator: VaultHealthIndicator;
  let lookup: jest.Mock;

  beforeEach(() => {
    indicator = new VaultHealthIndicator();
    lookup = jest.fn();
    (indicator as any).vaultService = { tokenLookupSelf: lookup };
    (indicator as any).logger = { error: jest.fn() };
    (indicator as any).healthIndicatorService = new HealthIndicatorService();
  });

  it('is healthy for a token without expiry', async () => {
    lookup.mockResolvedValue({ data: { expire_time: null } });
    await expect(indicator.isHealthy()).resolves.toEqual({
      vault: { status: 'up', data: { expire_time: null } },
    });
  });

  it('is healthy for a token that expires later', async () => {
    const expire_time = new Date(Date.now() + 3600_000).toISOString();
    lookup.mockResolvedValue({ data: { expire_time } });
    await expect(indicator.isHealthy()).resolves.toMatchObject({ vault: { status: 'up' } });
  });

  it('is down when the lookup throws', async () => {
    lookup.mockRejectedValue(new Error('down'));
    await expect(indicator.isHealthy()).resolves.toEqual({
      vault: { status: 'down', message: 'Failed to lookup self token!', error: 'down' },
    });
  });

  it('is down when data is empty', async () => {
    lookup.mockResolvedValue({ data: null });
    await expect(indicator.isHealthy()).resolves.toMatchObject({ vault: { status: 'down' } });
  });

  it('is down when the token expires within 5 minutes', async () => {
    lookup.mockResolvedValue({ data: { expire_time: new Date(Date.now() + 60_000).toISOString() } });
    await expect(indicator.isHealthy()).resolves.toMatchObject({
      vault: { status: 'down', message: 'Vault token is about to expire!' },
    });
  });
});
