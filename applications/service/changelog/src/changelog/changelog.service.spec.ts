import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockLoggerFactory } from '@rxap/nest-testing';
import { ChangelogService } from './changelog.service';
import {
  Application,
  Changelog,
  Language,
  LoadChangelogService,
  Version,
} from './load-changelog.service';

describe('ChangeLogService', () => {

  const generalChangelog = new Map<Version, Map<Language, Changelog>>();
  const applicationChangelog = new Map<Application, Map<Version, Map<Language, Changelog>>>();

  let changelogService: ChangelogService;


  beforeEach(async () => {
    jest.clearAllMocks();
    generalChangelog.clear();
    applicationChangelog.clear();
    const moduleRef = await Test
      .createTestingModule({
        providers: [ ChangelogService, LoadChangelogService, Logger ],
      })
      .overrideProvider(Logger)
      .useValue(MockLoggerFactory())
      .overrideProvider(LoadChangelogService)
      .useValue({
        applicationChangelog,
        generalChangelog,
      })
      .compile();

    changelogService = moduleRef.get(ChangelogService);
  });

  it('should load changelog for version without defined language', () => {

    generalChangelog.set('15.0.0', new Map<Language, Changelog>([ [ undefined, '# Change log' ] ]));
    applicationChangelog.set(
      'app',
      new Map<Version, Map<Language, Changelog>>([
        [
          '15.0.0',
          new Map<Language, Changelog>([ [ undefined, '# APP Change log' ] ]),
        ],
      ]),
    );

    expect(changelogService.getLatest())
      .toEqual({
        general: [ '# Change log' ],
        application: [],
      });
    expect(changelogService.getLatest('app'))
      .toEqual({
        general: [ '# Change log' ],
        application: [ '# APP Change log' ],
      });
    expect(changelogService.getVersion('15.0.0'))
      .toEqual({
        general: [ '# Change log' ],
        application: [],
      });
    expect(changelogService.getVersion('15.0.0', 'app'))
      .toEqual({
        general: [ '# Change log' ],
        application: [ '# APP Change log' ],
      });

  });

  it('should fallback to the default file with the requested language is not available', () => {

    generalChangelog.set('15.0.0', new Map<Language, Changelog>([ [ undefined, '# Change log' ] ]));
    applicationChangelog.set(
      'app',
      new Map<Version, Map<Language, Changelog>>([
        [
          '15.0.0',
          new Map<Language, Changelog>([ [ undefined, '# APP Change log' ] ]),
        ],
      ]),
    );

    expect(changelogService.getLatest(undefined, 'de'))
      .toEqual({
        general: [ '# Change log' ],
        application: [],
      });
    expect(changelogService.getLatest('app', 'de'))
      .toEqual({
        general: [ '# Change log' ],
        application: [ '# APP Change log' ],
      });
    expect(changelogService.getVersion('15.0.0', undefined, 'de'))
      .toEqual({
        general: [ '# Change log' ],
        application: [],
      });
    expect(changelogService.getVersion('15.0.0', 'app', 'de'))
      .toEqual({
        general: [ '# Change log' ],
        application: [ '# APP Change log' ],
      });

  });

  it('should load changelog for version with defined language', () => {

    generalChangelog.set(
      '15.0.0',
      new Map<Language, Changelog>([ [ undefined, '# Change log' ], [ 'de', '# Change log DE' ] ]),
    );
    applicationChangelog.set(
      'app',
      new Map<Version, Map<Language, Changelog>>([
        [
          '15.0.0',
          new Map<Language, Changelog>([ [ undefined, '# APP Change log' ], [ 'de', '# APP Change log DE' ] ]),
        ],
      ]),
    );

    expect(changelogService.getLatest(undefined, 'de'))
      .toEqual({
        general: [ '# Change log DE' ],
        application: [],
      });
    expect(changelogService.getLatest('app', 'de'))
      .toEqual({
        general: [ '# Change log DE' ],
        application: [ '# APP Change log DE' ],
      });
    expect(changelogService.getVersion('15.0.0', undefined, 'de'))
      .toEqual({
        general: [ '# Change log DE' ],
        application: [],
      });
    expect(changelogService.getVersion('15.0.0', 'app', 'de'))
      .toEqual({
        general: [ '# Change log DE' ],
        application: [ '# APP Change log DE' ],
      });

  });

});
