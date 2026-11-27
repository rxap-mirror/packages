import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { ValkeyHealthIndicator } from './valkey.health-indicator';
import { ValkeyService } from './valkey.service';

interface ValkeyMock {
  ping: jest.Mock;
}

function createValkeyMock(): ValkeyMock {
  return {
    ping: jest.fn().mockResolvedValue('PONG'),
  };
}

async function setup(valkey: ValkeyMock): Promise<ValkeyHealthIndicator> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      ValkeyHealthIndicator,
      HealthIndicatorService,
      { provide: ValkeyService, useValue: valkey },
    ],
  }).compile();
  return moduleRef.get(ValkeyHealthIndicator);
}

describe('ValkeyHealthIndicator', () => {
  let valkey: ValkeyMock;

  beforeEach(() => {
    valkey = createValkeyMock();
  });

  it('reports "up" when PING replies PONG', async () => {
    const indicator = await setup(valkey);

    const result = await indicator.isHealthy();

    expect(result['valkey'].status).toBe('up');
    expect(valkey.ping).toHaveBeenCalled();
  });

  it('reports "down" on an unexpected PING reply', async () => {
    valkey.ping.mockResolvedValue('WAT');
    const indicator = await setup(valkey);

    const result = await indicator.isHealthy();

    expect(result['valkey'].status).toBe('down');
  });

  it('reports "down" when the health probe throws', async () => {
    valkey.ping.mockRejectedValue(new Error('ECONNREFUSED'));
    const indicator = await setup(valkey);

    const result = await indicator.isHealthy();

    expect(result['valkey'].status).toBe('down');
    expect(result['valkey']['message']).toBe('ECONNREFUSED');
  });

  it('uses the provided key for the indicator name', async () => {
    const indicator = await setup(valkey);

    const result = await indicator.isHealthy('cache');

    expect(result['cache'].status).toBe('up');
  });
});
