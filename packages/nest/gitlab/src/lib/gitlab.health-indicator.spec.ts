import { GitbeakerRequestError } from '@gitbeaker/requester-utils';
import { HealthIndicatorService } from '@nestjs/terminus';
import { GitlabHealthIndicator } from './gitlab.health-indicator';
import { GitlabService } from './gitlab.service';

function requestError(status: number) {
  return new GitbeakerRequestError('Unauthorized', {
    cause: { description: 'Unauthorized', request: {} as Request, response: { status } as Response },
  });
}

function createIndicator({ show, hasCredentials }: { show: jest.Mock; hasCredentials: boolean }) {
  const gitlab = { Metadata: { show }, hasCredentials } as unknown as GitlabService;
  return new GitlabHealthIndicator(gitlab, new HealthIndicatorService());
}

describe('GitlabHealthIndicator', () => {
  it('is up when the GitLab API answers (token configured)', async () => {
    const show = jest.fn().mockResolvedValue({ version: '17.0.0' });

    await expect(createIndicator({ show, hasCredentials: true }).isHealthy()).resolves.toEqual({
      gitlab: { status: 'up' },
    });
    expect(show).toHaveBeenCalledTimes(1);
  });

  it('is down when the configured token is rejected (401)', async () => {
    const show = jest.fn().mockRejectedValue(requestError(401));

    await expect(createIndicator({ show, hasCredentials: true }).isHealthy()).resolves.toMatchObject({
      gitlab: { status: 'down', httpStatus: 401 },
    });
  });

  it('is down on server errors', async () => {
    const show = jest.fn().mockRejectedValue(requestError(502));

    await expect(createIndicator({ show, hasCredentials: false }).isHealthy()).resolves.toMatchObject({
      gitlab: { status: 'down', httpStatus: 502 },
    });
  });

  it('is down when GitLab is not reachable (no HTTP status)', async () => {
    const show = jest.fn().mockRejectedValue(new TypeError('fetch failed'));

    await expect(createIndicator({ show, hasCredentials: true }).isHealthy()).resolves.toMatchObject({
      gitlab: { status: 'down', message: expect.stringContaining('fetch failed') },
    });
  });

  describe('without a token', () => {
    it('is up when the API answers', async () => {
      const show = jest.fn().mockResolvedValue({});

      await expect(createIndicator({ show, hasCredentials: false }).isHealthy()).resolves.toEqual({
        gitlab: { status: 'up' },
      });
    });

    // /metadata requires authentication: a 401 still proves that the instance is reachable.
    it('is up on 401 (reachable, anonymous)', async () => {
      const show = jest.fn().mockRejectedValue(requestError(401));

      await expect(createIndicator({ show, hasCredentials: false }).isHealthy()).resolves.toEqual({
        gitlab: { status: 'up', authenticated: false },
      });
    });
  });
});
