import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { getGitlabErrorStatus } from './gitlab-error';
import { GitlabService } from './gitlab.service';

/**
 * Checks that the GitLab API answers (`GET /metadata`).
 *
 * - With a token (private or oauth): down if GitLab is unreachable or rejects the token.
 * - Without a token: `/metadata` answers 401, which still proves the instance is reachable, so that is up
 *   (reported with `authenticated: false`).
 */
@Injectable()
export class GitlabHealthIndicator {
  constructor(
    @Inject(GitlabService) private readonly gitlab: GitlabService,
    @Inject(HealthIndicatorService) private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('gitlab');
    try {
      await this.gitlab.Metadata.show();
      return indicator.up();
    } catch (error: any) {
      const status = getGitlabErrorStatus(error);
      if (status === 401 && !this.gitlab.hasCredentials) {
        return indicator.up({ authenticated: false });
      }
      return indicator.down({
        message: `GitLab API is not available: ${error?.message ?? error}`,
        ...(status !== undefined ? { httpStatus: status } : {}),
      });
    }
  }
}
