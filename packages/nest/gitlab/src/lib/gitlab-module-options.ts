import { BaseResourceOptions } from '@gitbeaker/requester-utils';

/**
 * The SDK options (host, token / oauthToken / jobToken, ...) plus the optional default project.
 */
export type GitlabModuleOptions<C extends boolean = false> = BaseResourceOptions<C> & {
  /**
   * The default project (numeric id or full path, e.g. `group/subgroup/project`).
   * Not an SDK option: it is kept by the {@link GitlabService} and never sent to the SDK.
   */
  project?: string | number;
};
