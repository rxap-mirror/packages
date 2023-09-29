import { kvsLocalStorage } from '@kvs/node-localstorage';
import { KvsStorage } from '@kvs/storage';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  clone,
  deepMerge,
} from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { mkdir } from 'fs-extra';
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

  async get(userId: string): Promise<UserSettings> {
    const fromStorage = await this.storage.get(userId);
    this.logger.verbose(`Get user settings for user ${ userId }: %JSON`, 'SettingsService', fromStorage);
    const merged = deepMerge(SettingsService.DefaultSettings, fromStorage ?? {});
    this.logger.verbose(`Get merged user settings for user ${ userId }: %JSON`, 'SettingsService', merged);
    return merged;
  }

  async set(userId: string, settings: Partial<UserSettings>) {
    this.logger.verbose(`Set user settings for user ${ userId }: %JSON`, 'SettingsService', settings);
    const merged = deepMerge(SettingsService.DefaultSettings, settings);
    this.logger.verbose(`Set merged user settings for user ${ userId }: %JSON`, 'SettingsService', merged);
    this.validate(merged);
    await this.storage.set(userId, clone(merged));
  }

  private async createStorage() {
    mkdir(this.config.getOrThrow('STORE_FILE_PATH'), { recursive: true });
    this.storage = await kvsLocalStorage({
      name: 'user-settings',
      storeFilePath: this.config.getOrThrow('STORE_FILE_PATH'),
      version: 1,
    });
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
