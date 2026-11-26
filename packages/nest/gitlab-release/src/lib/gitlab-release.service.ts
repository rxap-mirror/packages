import { ReleaseSchema } from '@gitbeaker/rest';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { classTransformOptions } from '@rxap/nest-dto';
import { GitlabService } from '@rxap/nest-gitlab';
import { OptionsDto } from '@rxap/nest-open-api';
import { plainToInstance } from 'class-transformer';

export function gitlabReleaseEnvironmentTierFilter(tier: string | undefined) {
  return (item: { tag_name: string }) => {
    switch (tier) {
      case 'production':
        return !!item.tag_name.match(/^v\d+\.\d+\.\d+$/);

      case 'staging':
        return !!item.tag_name.match(/^v\d+\.\d+\.\d+(-(rc)\.\d+)?$/);

      case 'testing':
        return !!item.tag_name.match(/^v\d+\.\d+\.\d+(-(preview|rc)\.\d+)?$/);
    }
    return true;
  };
}

/**
 * Builds a release filter that keeps only releases which expose a downloadable
 * asset with the given file name (e.g. `pwa.zip`).
 *
 * The check is purely metadata-based: `getReleases` already fetches full
 * `ReleaseSchema` objects (including `assets.links`), so this is free - no extra
 * HTTP request. A link with this file name only exists when the asset was
 * actually attached, which is exactly what we want to detect (a release can
 * exist while its `pwa.zip` was never uploaded).
 *
 * This is a cheap pre-filter; pair it with {@link GitlabReleaseService.assetExists}
 * to also confirm the file is truly downloadable.
 */
export function gitlabReleaseHasAsset(fileName: string) {
  return (item: ReleaseSchema): boolean => {
    const links = item.assets?.links ?? [];
    return links.some((link) => link.name === fileName || link.url?.endsWith(`/${fileName}`));
  };
}

@Injectable()
export class GitlabReleaseService {
  @Inject(GitlabService)
  private readonly gitlab!: GitlabService;
  private readonly logger = new Logger(this.constructor.name);

  getAssetDownloadLink(projectId: string | number, release: string, fileName: string): string {
    return `${this.gitlab.url.replace(/\/+$/, '')}/${this.buildDownloadEndpoint(projectId, release, fileName)}`;
  }

  /**
   * Builds the GitLab download endpoint for a release asset.
   *
   * GitLab exposes the most recent release under the `permalink/latest` path,
   * not `releases/latest`. Without this, a literal `latest` (e.g. the fallback
   * returned by AppVersionService when no channel release matches) would resolve
   * to a release literally tagged `latest` and 404.
   */
  private buildDownloadEndpoint(projectId: string | number, release: string, fileName: string): string {
    const releaseSegment = release === 'latest' ? 'permalink/latest' : encodeURIComponent(release);
    return `projects/${encodeURIComponent(projectId)}/releases/${releaseSegment}/downloads/${fileName}`;
  }

  /**
   * Checks whether a release asset (e.g. `pwa.zip`) is actually downloadable.
   *
   * Requests the asset's download endpoint with the authenticated client, but
   * releases the response body immediately instead of reading the whole file. gitbeaker throws on non-2xx responses, so a missing asset (404)
   * resolves to `false` without re-implementing token handling.
   */
  async assetExists(projectId: string | number, release: string, fileName: string): Promise<boolean> {
    const endpoint = this.buildDownloadEndpoint(projectId, release, fileName);
    try {
      const response = await this.gitlab.requester.get<ReadableStream>(endpoint, { asStream: true });
      // Release the stream without consuming it - we only care that the asset
      // exists, not its contents.
      await (response.body as any)?.cancel?.();
      return true;
    } catch (e: any) {
      this.logger.debug(`Release asset ${endpoint} is not downloadable: ${e.message}`);
      return false;
    }
  }

  /**
   * Fetches the releases of the GitLab project (up to 5 pages of 100, stopping at the first page with a match)
   * and returns the tags accepted by the filter as options.
   *
   * @param projectId The GitLab project id or path.
   * @param releaseFilter A function that filters the releases (default: stable and prerelease tags `vX.Y.Z[-id.N]`)
   *
   * @returns {Promise<OptionsDto<string, string>[]>} A promise resolving to a list of release options.
   */
  async getReleases(
    projectId: string | number,
    releaseFilter: (item: ReleaseSchema) => boolean = (item) => !!item.tag_name.match(/^v\d+\.\d+\.\d+(-\w+\.\d+)?$/),
  ): Promise<OptionsDto<string, string>[]> {
    const options: Array<{ value: string; display: string }> = [];
    try {
      let page = 1;
      const pageLimit = 5;
      do {
        const response = await this.gitlab.ProjectReleases.all(projectId, {
          perPage: 100,
          page,
        });
        options.push(
          ...response
            .filter((item) => item.tag_name)
            .filter((item) => releaseFilter(item))
            .map((item) => ({
              value: item.tag_name,
              display: item.name ?? item.tag_name,
            })),
        );
        page++;
      } while (!options.length && page <= pageLimit);
    } catch (e: any) {
      if (e.message?.includes('Unauthorized')) {
        this.logger.warn(`Unauthorized access to gitlab api. Check if the gitlab token is valid`);
      } else {
        this.logger.error(`Can not get releases from gitlab: ${e.message}`, e.stack);
      }
    }
    return plainToInstance<OptionsDto<string, string>, { value: string; display: string }>(
      OptionsDto,
      options,
      classTransformOptions,
    );
  }
}
