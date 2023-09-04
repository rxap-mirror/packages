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

  private defaultSettings: UserSettings = {
    darkMode: true,
    language: 'en',
  };

  async onApplicationBootstrap(): Promise<void> {
    this.storage = await kvsLocalStorage({
      name: 'user-settings',
      storeFilePath: this.config.getOrThrow('STORE_FILE_PATH'),
      version: 1,
    });
    const defaultSettingsFilePath = this.config.getOrThrow('SETTINGS_DEFAULT_FILE_PATH');
    if (existsSync(defaultSettingsFilePath)) {
      try {
        const defaultSettings = JSON.parse(readFileSync(defaultSettingsFilePath, 'utf-8'));
        this.defaultSettings = deepMerge(this.defaultSettings, defaultSettings);
      } catch (e: any) {
        this.logger.error(
          `Failed to load default settings from file: ${ defaultSettingsFilePath }: ${ e.message }`,
          undefined,
          'SettingsService',
        );
      }
    }
  }

  async get(userId: string): Promise<UserSettings> {
    return deepMerge(this.default(), (await this.storage.get(userId)) ?? {});
  }

  async set(userId: string, settings: UserSettings) {
    this.validate(settings);
    await this.storage.set(userId, settings);
  }

  default(): UserSettings {
    return clone(this.defaultSettings);
  }

  private validate(settings: UserSettings) {
    const { error } = UserSettingsSchema.validate(settings);
    if (error) {
      throw new BadRequestException(error.message);
    }
  }

}
