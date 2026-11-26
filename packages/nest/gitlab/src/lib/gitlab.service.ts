import { BaseResourceOptions, GitbeakerRequestError } from '@gitbeaker/requester-utils';
import { Gitlab } from '@gitbeaker/rest';
import { Inject, Injectable } from '@nestjs/common';
import { GitlabFileFingerprint } from './gitlab-file-fingerprint';
import { GitlabModuleOptions } from './gitlab-module-options';
import { GITLAB_OPTIONS } from './tokens';

const REQUIRED_PROJECT_MESSAGE =
  'No GitLab project given and none configured: set GITLAB_PROJECT (or the `project` module option)';

/**
 * Injectable GitLab client: the `@gitbeaker/rest` client configured from the module options.
 */
@Injectable()
export class GitlabService<C extends boolean = false> extends Gitlab<C> {
  /**
   * The configured default project (numeric id or path), if any.
   */
  public readonly project?: string | number;

  constructor(@Inject(GITLAB_OPTIONS) options: GitlabModuleOptions<C>) {
    const { project, ...sdkOptions } = options;
    super(sdkOptions as BaseResourceOptions<C>);
    this.project = project;
  }

  /**
   * Whether a token (private, oauth or job token) is configured.
   */
  get hasCredentials(): boolean {
    return Object.keys(this.authHeaders).length > 0;
  }

  /**
   * The configured default project; throws if none is configured.
   */
  requireProject(): string | number {
    if (this.project === undefined) {
      throw new Error(REQUIRED_PROJECT_MESSAGE);
    }
    return this.project;
  }

  /**
   * Describes a repository file without downloading it: `HEAD /projects/:id/repository/files/:path?ref=`
   * and reads the `X-Gitlab-*` headers (content SHA-256, blob id, commit id, ...).
   *
   * The SDK requester has no HEAD method, so the request is made with `fetch` using the
   * SDK's resolved url, headers and token (same auth behaviour as every other call).
   *
   * @param filePath path of the file in the repository
   * @param ref branch, tag or commit
   * @param projectId project id or path; defaults to the configured project
   * @returns the fingerprint, or `null` if GitLab answers 404 (the file does not exist at `ref`; GitLab also
   * answers 404 for an unknown project/ref or a project the token cannot see - a HEAD response has no body to tell them apart)
   * @throws GitbeakerRequestError for any other non 2xx status (401, 403, 5xx, ...)
   */
  async getFileFingerprint(
    filePath: string,
    ref: string,
    projectId: string | number | undefined = this.project,
  ): Promise<GitlabFileFingerprint | null> {
    if (projectId === undefined) {
      throw new Error(REQUIRED_PROJECT_MESSAGE);
    }

    const url =
      `${this.url.replace(/\/+$/, '')}/projects/${encodeURIComponent(projectId)}` +
      `/repository/files/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(ref)}`;

    const headers: Record<string, string> = { ...this.headers };
    for (const [name, resolve] of Object.entries(this.authHeaders)) {
      headers[name] = await resolve();
    }

    const init = { method: 'HEAD', headers };
    const response = await fetch(url, init);

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const description = response.statusText || `HTTP ${response.status}`;
      throw new GitbeakerRequestError(description, { cause: { description, request: new Request(url, init), response } });
    }

    const header = (name: string) => response.headers.get(name) ?? undefined;
    const contentSha256 = header('x-gitlab-content-sha256');
    const blobId = header('x-gitlab-blob-id');
    const commitId = header('x-gitlab-commit-id');
    for (const [name, value] of [
      ['X-Gitlab-Content-Sha256', contentSha256],
      ['X-Gitlab-Blob-Id', blobId],
      ['X-Gitlab-Commit-Id', commitId],
    ] as const) {
      if (!value) {
        throw new Error(`GitLab response for ${url} lacks the ${name} header`);
      }
    }
    const size = header('x-gitlab-size');
    const executeFilemode = header('x-gitlab-execute-filemode');

    return {
      contentSha256: contentSha256!,
      blobId: blobId!,
      commitId: commitId!,
      lastCommitId: header('x-gitlab-last-commit-id'),
      fileName: header('x-gitlab-file-name'),
      filePath: header('x-gitlab-file-path'),
      ref: header('x-gitlab-ref'),
      size: size === undefined ? undefined : Number(size),
      encoding: header('x-gitlab-encoding'),
      executeFilemode: executeFilemode === undefined ? undefined : executeFilemode === 'true',
    };
  }
}
