import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  readdirSync,
  readFileSync,
} from 'fs';
import mockFs from 'mock-fs';
import { join } from 'path';
import { SettingsService } from './settings.service';

export function MockConfigServiceFactory(config: Record<string, unknown> = {}) {
  return {
    get: (key: string) => config[key],
    getOrThrow: (key: string) => {
      if (config[key] === undefined) {
        throw new Error(`Config key ${ key } is not defined`);
      }
      return config[key];
    },
  };
}

export function MockLoggerFactory() {
  return {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
}

describe('SettingsService', () => {

  let service: SettingsService;
  let storage: Record<string, unknown>;
  let config: Record<string, any>;
  let logger: Logger;

  beforeEach(async () => {
    storage = {};
    config = {};
    const module = await Test
      .createTestingModule({
        providers: [
          SettingsService,
          Logger,
          ConfigService,
        ],
      })
      .overrideProvider(Logger)
      .useValue(MockLoggerFactory())
      .overrideProvider(ConfigService)
      .useValue(MockConfigServiceFactory(config))
      .compile();

    service = module.get(SettingsService);
    logger = module.get(Logger);
    Reflect.set(service, 'storage', {
      get: (userId: string) => Promise.resolve(storage[userId]),
      set: (userId: string, settings: Record<string, unknown>) => storage[userId] = settings,
    });
  });

  it('should inject service', () => {
    expect(service).toBeDefined();
  });

  it('should return default settings', async () => {
    const settings = await service.get('test');
    expect(settings).toEqual(SettingsService.DefaultSettings);
  });

  it('should set settings', async () => {
    const settings = {
      darkMode: false,
      language: 'qc',
      theme: {
        preset: 'default',
      },
    };
    await service.set('test', settings);
    expect(storage['test']).toEqual(settings);
  });

  it('should throw error if settings are invalid', async () => {
    const settings = {
      darkMode: false,
      language: 0,
      theme: {
        preset: 'default',
      },
      invalid: 'invalid',
    };
    await expect(service.set('test', settings as any)).rejects.toThrowError();
  });

  it('should merge default settings with user settings', async () => {
    const settings = {
      darkMode: false,
      language: 'pc',
      new: 'prop',
    };
    await expect(service.set('test', settings)).resolves.not.toThrowError();
    expect(storage['test']).toEqual({
      darkMode: false,
      language: 'pc',
      theme: {
        preset: 'default',
      },
      new: 'prop',
    });
  });

  it('should merge default settings with current stored settings', async () => {
    storage['test'] = {
      darkMode: false,
      language: 'pc',
      new: 'prop',
    };
    expect(await service.get('test')).toEqual({
      darkMode: false,
      language: 'pc',
      theme: {
        preset: 'default',
      },
      new: 'prop',
    });
  });

  it('should update settings if property already exists', async () => {
    storage['test'] = {
      darkMode: false,
      language: 'pc',
      new: 'prop',
      age: 5,
    };
    await service.set('test', {
      darkMode: false,
      language: 'pc',
      new: 'prop',
      age: 45,
    });
    expect(await service.get('test')).toEqual({
      darkMode: false,
      language: 'pc',
      new: 'prop',
      theme: {
        preset: 'default',
      },
      age: 45,
    });
  });

  describe('Kvs Local Storage', () => {

    beforeEach(async () => {
      config.STORE_FILE_PATH = '/tmp/data/user-settings';
      jest.spyOn(service, 'loadExternalDefaultSettings' as any).mockResolvedValue(undefined);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it('should create storage on application bootstrap', async () => {
      mockFs();
      await expect(service.onApplicationBootstrap()).resolves.not.toThrowError();
      expect(service['storage']).toBeDefined();
      expect(readdirSync(config.STORE_FILE_PATH)).toEqual([ 'user-settings.__.__kvs_version__' ]);
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.__kvs_version__'), 'utf-8')).toEqual('1');
    });

    it.skip('should write settings to storage if not already exists', async () => {
      mockFs();
      await service.onApplicationBootstrap();
      await service.set('test', {});
      expect(readdirSync(config.STORE_FILE_PATH)).toEqual([
        'user-settings.__.__kvs_version__',
        'user-settings.__.test',
      ]);
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.test'), 'utf-8'))
        .toEqual('{"darkMode":true,"language":"en","theme":{"preset":"default"}}');
    });

    it.skip('should read settings from file system if already exists', async () => {
      mockFs({
        [config.STORE_FILE_PATH]: mockFs.directory({
          items: {
            'user-settings.__.__kvs_version__': '1',
            'user-settings.__.test': JSON.stringify({
              darkMode: false,
              age: 45,
            }),
          },
        }),
      });
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.__kvs_version__'), 'utf-8')).toEqual('1');
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.test'), 'utf-8')).toEqual(JSON.stringify({
        darkMode: false,
        age: 45,
      }));
      await service.onApplicationBootstrap();
      expect(await service.get('test')).toEqual({
        darkMode: false,
        language: 'en',
        theme: { preset: 'default' },
        age: 45,
      });
    });

    it('should update settings in file system', async () => {
      mockFs({
        [config.STORE_FILE_PATH]: mockFs.directory({
          items: {
            'user-settings.__.__kvs_version__': '1',
            'user-settings.__.test': JSON.stringify({
              darkMode: false,
              age: 45,
            }),
          },
        }),
      });
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.__kvs_version__'), 'utf-8')).toEqual('1');
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.test'), 'utf-8')).toEqual(JSON.stringify({
        darkMode: false,
        age: 45,
      }));
      await service.onApplicationBootstrap();
      await service.set('test', { age: 46 });
      expect(readFileSync(join(config.STORE_FILE_PATH, 'user-settings.__.test'), 'utf-8'))
        .toEqual('{"darkMode":true,"language":"en","theme":{"preset":"default"},"age":46}');
    });

  });

  describe('External Settings Defaults', () => {

    beforeEach(async () => {
      config.SETTINGS_DEFAULT_FILE_PATH = '/tmp/default/user-settings.json';
      jest.spyOn(service, 'createStorage' as any).mockResolvedValue(undefined);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it('should load external default settings on application bootstrap', async () => {
      mockFs({
        [config.SETTINGS_DEFAULT_FILE_PATH]: JSON.stringify({
          darkMode: false,
          theme: {
            density: -2,
          },
        }),
      });
      await service.onApplicationBootstrap();
      expect(SettingsService.DefaultSettings).toEqual({
        darkMode: false,
        language: 'en',
        theme: {
          preset: 'default',
          density: -2,
        },
      });
    });

    it('should log error if external default settings are invalid', async () => {
      mockFs({
        [config.SETTINGS_DEFAULT_FILE_PATH]: JSON.stringify({
          darkMode: false,
          theme: {
            density: -5,
          },
        }),
      });
      await service.onApplicationBootstrap();
      expect(logger.error).toBeCalledWith(
        `Failed to load default settings from file: ${ config.SETTINGS_DEFAULT_FILE_PATH }: "theme.density" must be greater than or equal to -3`,
        undefined,
        'SettingsService',
      );
    });

  });

});
