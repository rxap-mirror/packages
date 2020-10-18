import {
  Inject,
  Injectable,
  PLATFORM_ID,
  Optional
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FullstoryConfig } from './fullstory.config';
import {
  RXAP_FULLSTORY_CONFIG,
  RXAP_FULLSTORY_ACTIVE
} from './tokens';
import * as FullStory from '@fullstory/browser';
import {
  UserVars,
  LogLevel
} from '@fullstory/browser';

@Injectable({ providedIn: 'root' })
export class FullstoryService {

  public readonly config: Readonly<FullstoryConfig>;

  constructor(
    @Inject(RXAP_FULLSTORY_CONFIG)
    config: any,
    @Inject(PLATFORM_ID)
    private platformId: any,
  ) {
    this.config = config;
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Fullstory is only supported on the browser platform. Current platform id: ', this.platformId);
      return;
    }
  }

  public init(): void {
    FullStory.init(this.config);
  }

  public event(eventName: string, eventProperties: { [key: string]: any }): void {
    FullStory.event(eventName, eventProperties);
  }

  public anonymize(): void {
    FullStory.anonymize();
  }

  public consent(userConsents?: boolean): void {
    FullStory.consent(userConsents);
  }

  public identify(uid: string, customVars?: UserVars): void {
    FullStory.identify(uid, customVars);
  }

  public log(level: LogLevel, msg: string): void {
    FullStory.log(level, msg);
  }

  public restart(): void {
    FullStory.restart();
  }

  public setUserVars(customVars: UserVars): void {
    FullStory.setUserVars(customVars);
  }

  public shutdown(): void {
    FullStory.shutdown();
  }

  public getCurrentSessionURL(now?: boolean): string | null {
    return FullStory.getCurrentSessionURL(now);
  }

}
