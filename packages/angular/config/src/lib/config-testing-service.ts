import { Injectable } from '@angular/core';
import {
  getFromObject,
  SetToObject,
} from '@rxap/utilities';
import { ConfigService } from './config.service';

@Injectable()
export class ConfigTestingService implements ConfigService {
  readonly config: Record<string, any> = {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearLocalConfig(): void {
  }

  set<T>(propertyPath: string, value: T): void {
    SetToObject(this.config, propertyPath, value);
  }

  get<T>(propertyPath: string, defaultValue?: T): T | undefined {
    return getFromObject<T, T>(this.config, propertyPath, defaultValue);
  }

  getOrThrow<T>(propertyPath: string): T {
    const value = this.get<T>(propertyPath);
    if (value === undefined) {
      throw new Error(`Could not find config in path '${ propertyPath }'`);
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLocalConfig(config: Record<string, any>): void {
  }
}
