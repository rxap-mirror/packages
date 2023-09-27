import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { LoadChangelogService } from './load-changelog.service';

jest.mock('fs');

describe('LoadChangelogService', () => {

  let loadChangelogService: LoadChangelogService;
  const configService = {
    cache: new Map<string, any>(),
    get(name: string, defaultValue?: any) {
      return this.cache.get(name) ?? defaultValue;
    },
    getOrThrow(name: string) {
      if (!this.cache.has(name)) {
        throw new Error(`Config value ${ name } not set`);
      }
      return this.cache.get(name);
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    configService.cache.clear();
    configService.cache.set('DATA_DIR', '/data');
    const moduleRef = await Test
      .createTestingModule({
        providers: [ LoadChangelogService, ConfigService, Logger ],
      })
      .overrideProvider(Logger)
      .useValue(console)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    loadChangelogService = moduleRef.get(LoadChangelogService);
  });

  describe('Load file', () => {

    it('should load localized files', () => {

      (readFileSync as jest.Mock).mockReturnValue('# Change log');
      (existsSync as jest.Mock).mockReturnValue(true);

      loadChangelogService.loadFile('/data/15.0.0/changelog.de.md');
      loadChangelogService.loadFile('/data/15.0.0/changelog.de-DE.md');
      loadChangelogService.loadFile('/data/15.0.0/changelog.de_DE.md');

      expect(loadChangelogService.generalChangelog.get('15.0.0').get('de')).toEqual('# Change log');
      expect(loadChangelogService.generalChangelog.get('15.0.0').get('de-DE')).toEqual('# Change log');
      expect(loadChangelogService.generalChangelog.get('15.0.0').get('de_DE')).toEqual('# Change log');

    });

    it('should replace environment variables in file content', () => {

      (readFileSync as jest.Mock).mockReturnValue('# Change log ${ROOT_DOMAIN}');
      (existsSync as jest.Mock).mockReturnValue(true);
      configService.cache.set('ROOT_DOMAIN', 'rxap.dev');

      loadChangelogService.loadFile('/data/15.0.0/changelog.md');

      expect(loadChangelogService.generalChangelog.get('15.0.0').get(undefined)).toEqual('# Change log rxap.dev');

    });

    it('should throw if environment variables in file content is not defined', () => {

      (readFileSync as jest.Mock).mockReturnValue('# Change log ${NOT_EXISTS_ROOT_DOMAIN}');
      (existsSync as jest.Mock).mockReturnValue(true);

      expect(() => loadChangelogService.loadFile('/data/15.0.0/changelog.md'))
        .toThrow('environment variable not found: NOT_EXISTS_ROOT_DOMAIN');

    });

    it('should not throw if optional environment variables in file content is not defined', () => {

      (readFileSync as jest.Mock).mockReturnValue('# Change log ${NOT_EXISTS_ROOT_DOMAIN?}');
      (existsSync as jest.Mock).mockReturnValue(true);

      expect(() => loadChangelogService.loadFile('/data/15.0.0/changelog.md'))
        .not
        .toThrow('environment variable not found: NOT_EXISTS_ROOT_DOMAIN');

    });

    it('should replace optional environment variables in file content if not defined', () => {

      (readFileSync as jest.Mock).mockReturnValue('# Change log ${NOT_EXISTS_ROOT_DOMAIN?}');
      (existsSync as jest.Mock).mockReturnValue(true);

      loadChangelogService.loadFile('/data/15.0.0/changelog.md');

      expect(loadChangelogService.generalChangelog.get('15.0.0').get(undefined)).toEqual('# Change log ');

    });

    it('should transform markdown image urls', () => {

      (readFileSync as jest.Mock).mockReturnValue(`# Change log
      ![](./image.png)
      ![](/image.png)
      ![](image.png)
      ![](../image.png)
      ![](http://google.com/image.png)
      ![](https://google.com/image.png)
      `);
      (existsSync as jest.Mock).mockReturnValue(true);
      configService.cache.set('PUBLIC_URL', 'https://rxap.dev/api/jest/');

      loadChangelogService.loadFile('/data/15.0.0/changelog.md');

      expect(loadChangelogService.generalChangelog.get('15.0.0').get(undefined)).toEqual(`# Change log
      ![](https://rxap.dev/api/jest/data/15.0.0/image.png)
      ![](https://rxap.dev/api/jest/data/image.png)
      ![](https://rxap.dev/api/jest/data/15.0.0/image.png)
      ![](https://rxap.dev/api/jest/data/image.png)
      ![](http://google.com/image.png)
      ![](https://google.com/image.png)
      `);

    });

    it('should throw if the markdown image url are pointing to a non static file', () => {

      (readFileSync as jest.Mock).mockReturnValue(`# Change log
      ![](./image.png)
      ![](/image.png)
      ![](image.png)
      ![](../../../image.png)
      ![](http://google.com/image.png)
      ![](https://google.com/image.png)
      `);
      (existsSync as jest.Mock).mockReturnValue(true);
      configService.cache.set('PUBLIC_URL', 'https://rxap.dev/api/jest/');

      expect(() => loadChangelogService.loadFile('/data/15.0.0/changelog.md'))
        .toThrow('asset path points outside of the allowed asset folder: ');

    });

  });

});
