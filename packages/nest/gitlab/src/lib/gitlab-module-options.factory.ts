import { ConfigurableModuleOptionsFactory, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitlabModuleOptions } from './gitlab-module-options';

/**
 * Reads the options from the {@link ConfigService}:
 * `GITLAB_HOST` (default `https://gitlab.com`), `GITLAB_TOKEN` (PRIVATE-TOKEN header),
 * `GITLAB_OAUTH_TOKEN` (`Authorization: Bearer`) and `GITLAB_PROJECT`.
 *
 * Unset values are omitted from the options (the SDK treats the mere presence of a token key as configured).
 */
@Injectable()
export class GitlabModuleOptionsFactory<C extends boolean = false>
  implements ConfigurableModuleOptionsFactory<GitlabModuleOptions<C>, 'create'>
{
  @Inject(ConfigService)
  protected readonly config!: ConfigService;
  protected readonly logger = new Logger(this.constructor.name);

  async create(): Promise<GitlabModuleOptions<C>> {
    this.logger.verbose('Create gitlab options');
    const token = this.get('GITLAB_TOKEN');
    const oauthToken = this.get('GITLAB_OAUTH_TOKEN');
    const project = this.get('GITLAB_PROJECT');

    if (token && oauthToken) {
      throw new Error(
        'GITLAB_TOKEN and GITLAB_OAUTH_TOKEN are mutually exclusive: set only the token type the GitLab instance accepts',
      );
    }

    return {
      host: this.get('GITLAB_HOST') ?? 'https://gitlab.com',
      ...(token ? { token } : {}),
      ...(oauthToken ? { oauthToken } : {}),
      ...(project ? { project } : {}),
    } as GitlabModuleOptions<C>;
  }

  private get(key: string): string | undefined {
    const value = this.config.get<string>(key);
    return value === '' ? undefined : value;
  }
}
