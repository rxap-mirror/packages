import { Injectable, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { GitlabModuleOptionsFactory } from './gitlab-module-options.factory';
import { GitlabHealthIndicator } from './gitlab.health-indicator';
import { GitlabModule } from './gitlab.module';
import { GitlabService } from './gitlab.service';
import { GITLAB_OPTIONS } from './tokens';

@Injectable()
class Consumer {
  constructor(public readonly gitlab: GitlabService) {}
}

// does not import GitlabModule itself: only works when the module is global
@Module({ providers: [Consumer], exports: [Consumer] })
class ConsumerModule {}

describe('GitlabModule', () => {
  it('register provides the service with the given options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GitlabModule.register({ host: 'https://git.example.com', token: 't', project: 'g/p' })],
    }).compile();

    const service = moduleRef.get(GitlabService);
    expect(service.url).toBe('https://git.example.com/api/v4/');
    expect(service.project).toBe('g/p');
    expect(service.hasCredentials).toBe(true);
  });

  it('GITLAB_OPTIONS points at the module options', async () => {
    const options = { host: 'https://git.example.com', oauthToken: 'o' };
    const moduleRef = await Test.createTestingModule({ imports: [GitlabModule.register(options)] }).compile();

    expect(moduleRef.get(GITLAB_OPTIONS)).toEqual(options);
  });

  it('registerAsync accepts a factory', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GitlabModule.registerAsync({ useFactory: async () => ({ token: 'async', project: 7 }) })],
    }).compile();

    expect(moduleRef.get(GITLAB_OPTIONS)).toEqual({ token: 'async', project: 7 });
    expect(moduleRef.get(GitlabService).project).toBe(7);
  });

  it('registerAsync works with the config based options factory', async () => {
    const env = { GITLAB_HOST: 'https://git.example.com', GITLAB_OAUTH_TOKEN: 'o', GITLAB_PROJECT: 'g/p' };
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, ignoreEnvVars: true, load: [() => env] }),
        GitlabModule.registerAsync({ imports: [ConfigModule], useClass: GitlabModuleOptionsFactory }),
      ],
    }).compile();

    expect(moduleRef.get(GITLAB_OPTIONS)).toEqual({
      host: 'https://git.example.com',
      oauthToken: 'o',
      project: 'g/p',
    });
  });

  it('is global: other modules can inject the service without importing the module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GitlabModule.register({ token: 't' }), ConsumerModule],
    }).compile();

    expect(moduleRef.get(Consumer).gitlab).toBe(moduleRef.get(GitlabService));
  });

  it('exports the health indicator', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GitlabModule.register({ token: 't' })],
    }).compile();

    expect(moduleRef.get(GitlabHealthIndicator)).toBeInstanceOf(GitlabHealthIndicator);
  });

  it('does not provide the release service (lives in @rxap/nest-gitlab-release)', () => {
    const module = GitlabModule.register({ token: 't' });
    const names = (module.providers ?? []).map((p: any) => p.name ?? p.provide?.toString());
    expect(names).not.toContain('GitlabReleaseService');
  });
});
