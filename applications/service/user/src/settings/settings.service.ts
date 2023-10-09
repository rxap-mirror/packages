import {
  kvsStorage,
  KvsStorage,
} from '@kvs/storage';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorage } from '@rxap/node-local-storage';
import {
  clone,
  deepMerge,
} from '@rxap/utilities';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import {
  UserSettings,
  UserSettingsSchema,
} from './settings';

export interface StorageSchema {
  [key: string]: UserSettings;
}

@Injectable()
export class SettingsService implements OnApplicationBootstrap {

  private storage: KvsStorage<StorageSchema>;

  @Inject(ConfigService)
  private readonly config: ConfigService;

  @Inject(Logger)
  private readonly logger: Logger;

  private static defaultSettings: UserSettings = {
    darkMode: true,
    language: 'en',
    theme: {
      preset: 'default',
    },
  };

  public static get DefaultSettings(): UserSettings {
    return clone(SettingsService.defaultSettings);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createStorage();
    this.loadExternalDefaultSettings();
  }

  async get(userId: string, defaultSettings: Partial<UserSettings> = {}): Promise<UserSettings> {
    let fromStorage: Partial<UserSettings> | undefined = undefined;
    try {
      fromStorage = await this.storage.get(userId);
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Failed to read user settings for user '${ userId }' from the file system: ${ e.message }`);
    }
    fromStorage ??= defaultSettings;
    this.logger.verbose(`Get user settings for user ${ userId }: %JSON`, fromStorage, 'SettingsService');
    const merged = deepMerge(SettingsService.DefaultSettings, fromStorage ?? {});
    this.logger.verbose(`Get merged user settings for user ${ userId }: %JSON`, merged, 'SettingsService');
    return merged;
  }

  async set(userId: string, settings: Partial<UserSettings>) {
    this.logger.verbose(`Set user settings for user ${ userId }: %JSON`, settings, 'SettingsService');
    const merged = deepMerge(SettingsService.DefaultSettings, settings);
    this.logger.verbose(`Set merged user settings for user ${ userId }: %JSON`, merged, 'SettingsService');
    this.validate(merged);
    const cloned = clone(merged);
    try {
      await this.storage.set(userId, cloned);
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Failed to write user settings for user '${ userId }' to the file system: ${ e.message }`);
    }
  }

  private async createStorage() {
    mkdirSync(this.config.getOrThrow('STORE_FILE_PATH'), { recursive: true });
    const version = 1;
    if (!existsSync(join(this.config.getOrThrow('STORE_FILE_PATH'), 'user-settings.__.__kvs_version__'))) {
      writeFileSync(
        join(this.config.getOrThrow('STORE_FILE_PATH'), 'user-settings.__.__kvs_version__'),
        JSON.stringify(version),
        'utf-8',
      );
    }
    const storage = new LocalStorage(this.config.getOrThrow('STORE_FILE_PATH'));
    try {
      this.storage = await kvsStorage({
        name: 'user-settings',
        version,
        storage,
      });
    } catch (e: any) {
      throw new Error(`Failed to create the user settings storage: ${ e.message }`);
    }
  }

  private loadExternalDefaultSettings() {
    const defaultSettingsFilePath = this.config.getOrThrow('SETTINGS_DEFAULT_FILE_PATH');
    if (existsSync(defaultSettingsFilePath)) {
      try {
        const defaultSettings = JSON.parse(readFileSync(defaultSettingsFilePath, 'utf-8'));
        const newDefaultSettings = deepMerge(SettingsService.DefaultSettings, defaultSettings);
        this.validate(newDefaultSettings);
        SettingsService.defaultSettings = newDefaultSettings;
      } catch (e: any) {
        this.logger.error(
          `Failed to load default settings from file: ${ defaultSettingsFilePath }: ${ e.message }`,
          undefined,
          'SettingsService',
        );
      }
    }
  }

  private validate(settings: UserSettings) {
    const { error } = UserSettingsSchema.validate(settings);
    if (error) {
      throw new BadRequestException(error.message);
    }
  }

}
