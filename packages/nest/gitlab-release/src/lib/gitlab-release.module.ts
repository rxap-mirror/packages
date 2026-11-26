import { Module } from '@nestjs/common';
import { GitlabReleaseService } from './gitlab-release.service';

/**
 * Provides the {@link GitlabReleaseService}. Requires the (global) `GitlabModule` from `@rxap/nest-gitlab`.
 */
@Module({
  providers: [GitlabReleaseService],
  exports: [GitlabReleaseService],
})
export class GitlabReleaseModule {}
