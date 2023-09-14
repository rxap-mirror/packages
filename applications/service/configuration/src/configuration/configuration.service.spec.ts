import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigurationService } from './configuration.service';
import { LoadConfigurationService } from './load-configuration.service';

describe('ConfigurationService', () => {

  let configurationService: ConfigurationService;
  const loadConfigurationService = {
    applicationConfiguration: new Map<string, Map<string, Record<string, unknown>>>(),
    generalConfiguration: new Map<string, Record<string, unknown>>(),
  };

  beforeEach(async () => {
    const moduleRef = await Test
      .createTestingModule({
        providers: [ ConfigurationService, Logger, LoadConfigurationService ],
      })
      .overrideProvider(Logger)
      .useValue(console)
      .overrideProvider(LoadConfigurationService)
      .useValue(loadConfigurationService)
      .compile();

    configurationService = moduleRef.get(ConfigurationService);
  });

  it('should return application specific configuration', () => {

    loadConfigurationService.generalConfiguration.set(
      'latest',
      {
        test: 'general',
        general: 'value',
      },
    );
    loadConfigurationService.applicationConfiguration.set(
      'test',
      new Map<string, Record<string, unknown>>([
        [
          'latest',
          {
            test: 'test',
            specific: 'value',
          },
        ],
      ]),
    );

    expect(loadConfigurationService.applicationConfiguration.has('test')).toBeTruthy();
    expect(loadConfigurationService.applicationConfiguration.get('test').has('latest')).toBeTruthy();
    expect(loadConfigurationService.applicationConfiguration.get('test').get('latest'))
      .toEqual({
        test: 'test',
        specific: 'value',
      });

    expect(configurationService.getLatest('test'))
      .toEqual({
        test: 'test',
        general: 'value',
        specific: 'value',
      });

  });

  it('should return application specific configuration while overwriting array values', () => {

    loadConfigurationService.generalConfiguration.set(
      'latest',
      {
        test: 'general',
        general: 'value',
        items: [ 'a', 'b', 'C' ],
      },
    );
    loadConfigurationService.applicationConfiguration.set(
      'test',
      new Map<string, Record<string, unknown>>([
        [
          'latest',
          {
            test: 'test',
            specific: 'value',
            items: [ 'r', 'f', 'q' ],
          },
        ],
      ]),
    );

    expect(configurationService.getLatest('test'))
      .toEqual({
        test: 'test',
        general: 'value',
        specific: 'value',
        items: [ 'r', 'f', 'q' ],
      });

  });

  it('should return application specific configuration while overwriting complex array values', () => {

    loadConfigurationService.generalConfiguration.set(
      'latest',
      {
        test: 'general',
        general: 'value',
        items: [ 'a', { data: 'data' }, { test: [ 'a' ] }, 'c', 'd' ],
      },
    );
    loadConfigurationService.applicationConfiguration.set(
      'test',
      new Map<string, Record<string, unknown>>([
        [
          'latest',
          {
            test: 'test',
            specific: 'value',
            items: [ { new: '' }, [ 'test' ], 'q' ],
          },
        ],
      ]),
    );

    expect(configurationService.getLatest('test'))
      .toEqual({
        test: 'test',
        general: 'value',
        specific: 'value',
        items: [ { new: '' }, [ 'test' ], 'q' ],
      });

  });

});
