import { ReleaseSchema } from '@gitbeaker/rest';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GitlabService } from '@rxap/nest-gitlab';
import {
  gitlabReleaseEnvironmentTierFilter,
  gitlabReleaseHasAsset,
  GitlabReleaseService,
} from './gitlab-release.service';

/** Builds a minimal ReleaseSchema-shaped object with the given asset links. */
function releaseWithLinks(links: Array<Partial<{ name: string; url: string }>>): ReleaseSchema {
  return { tag_name: 'v1.2.3', assets: { links } } as unknown as ReleaseSchema;
}

describe('GitlabReleaseService', () => {
  let service: GitlabReleaseService;
  let get: jest.Mock;
  let all: jest.Mock;
  let logger: { warn: jest.Mock; error: jest.Mock; log: jest.Mock; debug: jest.Mock };

  beforeEach(async () => {
    get = jest.fn();
    all = jest.fn();
    logger = { warn: jest.fn(), error: jest.fn(), log: jest.fn(), debug: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GitlabReleaseService,
        {
          provide: GitlabService,
          useValue: { url: 'https://gitlab.com/api/v4/', requester: { get }, ProjectReleases: { all } },
        },
        { provide: Logger, useValue: logger },
      ],
    }).compile();
    service = moduleRef.get(GitlabReleaseService);
    // the service owns its logger instance: silence it via the prototype
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(logger.warn);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(logger.error);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(logger.debug);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAssetDownloadLink', () => {
    it('builds the download url without a double slash and encodes project and release', () => {
      expect(service.getAssetDownloadLink('group/project', 'v1.0.0+1', 'pwa.zip')).toBe(
        'https://gitlab.com/api/v4/projects/group%2Fproject/releases/v1.0.0%2B1/downloads/pwa.zip',
      );
    });
  });

  describe('assetExists', () => {
    it('returns true and releases the body when the asset is downloadable', async () => {
      const cancel = jest.fn().mockResolvedValue(undefined);
      get.mockResolvedValue({ body: { cancel } });

      const exists = await service.assetExists(68992061, 'v0.0.2-nightly.4', 'pwa.zip');

      expect(exists).toBe(true);
      expect(get).toHaveBeenCalledWith('projects/68992061/releases/v0.0.2-nightly.4/downloads/pwa.zip', {
        asStream: true,
      });
      // The body must be cancelled, not streamed to completion.
      expect(cancel).toHaveBeenCalledTimes(1);
    });

    it("targets the permalink endpoint when release is 'latest'", async () => {
      get.mockResolvedValue({ body: { cancel: jest.fn() } });

      await service.assetExists(68992061, 'latest', 'pwa.zip');

      expect(get).toHaveBeenCalledWith('projects/68992061/releases/permalink/latest/downloads/pwa.zip', {
        asStream: true,
      });
    });

    it('returns false when the asset is missing (request rejects)', async () => {
      get.mockRejectedValue(new Error('Not Found'));

      await expect(service.assetExists(1, 'v1.0.0', 'pwa.zip')).resolves.toBe(false);
    });
  });

  describe('getReleases', () => {
    const release = (tag_name: string, name?: string) => ({ tag_name, name });

    it('maps releases to options (display falls back to the tag name)', async () => {
      all.mockResolvedValueOnce([release('v1.0.0', 'First'), release('v1.1.0')]);

      const options = await service.getReleases(7);

      expect(all).toHaveBeenCalledWith(7, { perPage: 100, page: 1 });
      expect(options.map((o) => ({ value: o.value, display: o.display }))).toEqual([
        { value: 'v1.0.0', display: 'First' },
        { value: 'v1.1.0', display: 'v1.1.0' },
      ]);
    });

    it('by default keeps only stable and prerelease tags', async () => {
      all.mockResolvedValueOnce([release('v1.0.0'), release('v1.1.0-rc.1'), release('nightly'), release('')]);

      const options = await service.getReleases(7);

      expect(options.map((o) => o.value)).toEqual(['v1.0.0', 'v1.1.0-rc.1']);
    });

    it('applies the given filter', async () => {
      all.mockResolvedValueOnce([release('v1.0.0'), release('v1.1.0-rc.1')]);

      const options = await service.getReleases(7, (item) => item.tag_name.includes('rc'));

      expect(options.map((o) => o.value)).toEqual(['v1.1.0-rc.1']);
    });

    it('requests the next page while nothing matched, up to 5 pages', async () => {
      all.mockResolvedValue([release('nightly')]);

      await expect(service.getReleases(7)).resolves.toEqual([]);

      expect(all).toHaveBeenCalledTimes(5);
      expect(all).toHaveBeenLastCalledWith(7, { perPage: 100, page: 5 });
    });

    it('stops at the first page with a match', async () => {
      all.mockResolvedValueOnce([release('nightly')]).mockResolvedValueOnce([release('v2.0.0')]);

      const options = await service.getReleases(7);

      expect(all).toHaveBeenCalledTimes(2);
      expect(options.map((o) => o.value)).toEqual(['v2.0.0']);
    });

    it('warns and returns no releases when the token is rejected', async () => {
      all.mockRejectedValue(new Error('Unauthorized'));

      await expect(service.getReleases(7)).resolves.toEqual([]);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unauthorized access'));
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs an error and returns no releases for any other failure', async () => {
      all.mockRejectedValue(new Error('boom'));

      await expect(service.getReleases(7)).resolves.toEqual([]);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('boom'), expect.anything());
    });
  });
});

describe('gitlabReleaseHasAsset', () => {
  const hasPwa = gitlabReleaseHasAsset('pwa.zip');

  it('matches a link whose url ends in /pwa.zip', () => {
    expect(
      hasPwa(releaseWithLinks([{ url: 'https://gitlab.com/g/p/-/releases/v1.2.3/downloads/pwa.zip' }])),
    ).toBe(true);
  });

  it('matches a link by name', () => {
    expect(hasPwa(releaseWithLinks([{ name: 'pwa.zip', url: 'https://x/y' }]))).toBe(true);
  });

  it('returns false when no link resolves to the asset', () => {
    expect(hasPwa(releaseWithLinks([{ name: 'other.zip', url: 'https://x/downloads/other.zip' }]))).toBe(false);
  });

  it('returns false when the release has no asset links', () => {
    expect(hasPwa(releaseWithLinks([]))).toBe(false);
    expect(hasPwa({ tag_name: 'v1.2.3' } as unknown as ReleaseSchema)).toBe(false);
  });
});

describe('gitlabReleaseEnvironmentTierFilter', () => {
  const tag = (tag_name: string) => ({ tag_name });

  it.each([
    ['production', 'v1.2.3', true],
    ['production', 'v1.2.3-rc.1', false],
    ['staging', 'v1.2.3-rc.1', true],
    ['staging', 'v1.2.3-preview.1', false],
    ['testing', 'v1.2.3-preview.1', true],
    ['testing', 'v1.2.3-nightly.1', false],
    ['development', 'v1.2.3-nightly.1', true],
    [undefined, 'anything', true],
  ])('tier %s tag %s -> %s', (tier, tagName, expected) => {
    expect(gitlabReleaseEnvironmentTierFilter(tier)(tag(tagName))).toBe(expected);
  });
});
