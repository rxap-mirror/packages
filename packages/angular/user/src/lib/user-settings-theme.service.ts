import {
  inject,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import {
  IsThemeDensity,
  ThemeDensity,
} from '@rxap/utilities';
import {
  debounceTime,
  Subscription,
  tap,
} from 'rxjs';
import { ThemeControllerGetRemoteMethod } from './openapi/remote-methods/theme-controller-get.remote-method';
import { ThemeControllerSetDensityRemoteMethod } from './openapi/remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetPresetRemoteMethod } from './openapi/remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetTypographyRemoteMethod } from './openapi/remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetRemoteMethod } from './openapi/remote-methods/theme-controller-set.remote-method';
import { ThemeControllerSetRequestBody } from './openapi/request-bodies/theme-controller-set.request-body';
import { ThemeControllerGetResponse } from './openapi/responses/theme-controller-get.response';
import { UserSettingsThemeDataSource } from './user-settings-theme.data-source';

@Injectable({ providedIn: 'root' })
export class UserSettingsThemeService<T = unknown> implements OnDestroy {

  protected readonly getThemeMethod = inject(ThemeControllerGetRemoteMethod);
  protected readonly setThemeMethod = inject(ThemeControllerSetRemoteMethod);
  protected readonly setDensityMethod = inject(ThemeControllerSetDensityRemoteMethod);
  protected readonly setPresetMethod = inject(ThemeControllerSetPresetRemoteMethod);
  protected readonly setTypographyMethod = inject(ThemeControllerSetTypographyRemoteMethod);
  protected readonly userSettingsThemeDataSource = inject(UserSettingsThemeDataSource);
  protected readonly pubSub = inject(PubSubService);

  protected syncSubscription?: Subscription;

  async get(): Promise<ThemeControllerGetResponse<T>> {
    this.subscribe();
    return this.getThemeMethod.call();
  }

  async set(themeSettings: ThemeControllerSetRequestBody<T>) {
    this.subscribe();
    await this.setThemeMethod.call({ requestBody: themeSettings });
    this.userSettingsThemeDataSource.refresh();
  }

  async setDensity(density: ThemeDensity) {
    this.subscribe();
    await this.setDensityMethod.call({ requestBody: { value: density } });
    this.userSettingsThemeDataSource.refresh();
  }

  async setPreset(preset: string) {
    this.subscribe();
    await this.setPresetMethod.call({ requestBody: { value: preset } });
    this.userSettingsThemeDataSource.refresh();
  }

  async setTypography(typography: string) {
    this.subscribe();
    await this.setTypographyMethod.call({ requestBody: { value: typography } });
    this.userSettingsThemeDataSource.refresh();
  }

  /**
   * Subscribes to three different topics and performs certain actions based on the received data.
   * This method creates a subscription and adds it to the syncSubscription property.
   * If syncSubscription is already defined, this method will not create a new subscription.
   *
   * The method subscribes to the following topics:
   * - RXAP_TOPICS.theme.density.changed: It debounces the received event by 1000ms and then performs an action if the event data is of type IsThemeDensity.
   * - RXAP_TOPICS.theme.preset.changed: It debounces the received event by 1000ms and then performs an action if the event data is of type string.
   * - RXAP_TOPICS.theme.typography.changed: It debounces the received event by 1000ms and then performs an action if the event data is of type string.
   *
   * @returns {void}
   */
  protected subscribe() {
    if (this.syncSubscription) {
      return;
    }
    this.syncSubscription = new Subscription();
    this.syncSubscription.add(this.pubSub.subscribe(RXAP_TOPICS.theme.density.changed).pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (IsThemeDensity(event.data)) {
          await this.setDensity(event.data);
        }
      }),
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe(RXAP_TOPICS.theme.preset.changed).pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (typeof event.data === 'string') {
          await this.setPreset(event.data);
        }
      }),
    ).subscribe());
    this.syncSubscription.add(this.pubSub.subscribe(RXAP_TOPICS.theme.typography.changed).pipe(
      debounceTime(1000),
      tap(async (event) => {
        if (typeof event.data === 'string') {
          await this.setTypography(event.data);
        }
      }),
    ).subscribe());
  }

  async restore() {
    const theme = await this.get();
    this.pubSub.publish(RXAP_TOPICS.theme.preset.restore, theme.preset);
    this.pubSub.publish(RXAP_TOPICS.theme.density.restore, theme.density);
    this.pubSub.publish(RXAP_TOPICS.theme.typography.restore, theme.typography);
  }

  ngOnDestroy() {
    this.syncSubscription?.unsubscribe();
  }

}
