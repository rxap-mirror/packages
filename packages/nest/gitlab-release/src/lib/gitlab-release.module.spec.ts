import { Test } from '@nestjs/testing';
import { GitlabModule } from '@rxap/nest-gitlab';
import { GitlabReleaseModule } from './gitlab-release.module';
import { GitlabReleaseService } from './gitlab-release.service';

describe('GitlabReleaseModule', () => {
  it('provides the release service on top of the GitlabModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GitlabModule.register({ token: 't' }), GitlabReleaseModule],
    }).compile();

    expect(moduleRef.get(GitlabReleaseService)).toBeInstanceOf(GitlabReleaseService);
  });
});
