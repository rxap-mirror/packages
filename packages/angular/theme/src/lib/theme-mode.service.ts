import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  computed,
  effect,
  inject,
  Inject,
  Injectable,
  OnDestroy,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import { isDefined } from '@rxap/rxjs';
import {
  debounceTime,
  map,
  Subscription,
  tap,
} from 'rxjs';

// Represents the user's preference setting ('system', 'light', or 'dark')
export type ThemeSetting = 'system' | 'light' | 'dark';
// Represents the currently active theme ('light' or 'dark')
export type ActiveTheme = 'light' | 'dark';

export const THEME_SETTING_KEY = 'rxap_theme_settings';

/**
 * Service to manage theme mode (light/dark/system) for the application.
 * It provides functionality to handle theme preferences, persist them, and synchronize changes.
 *
 * This service integrates with media queries to detect system-level theme changes and allows the user
 * or application logic to toggle or set a specific theme.
 *
 * It utilizes dependency injection to access various required services and the document object.
 * Additionally, it publishes theme-related events for other parts of the application to react to
 * theme changes.
 */
@Injectable({ providedIn: 'root' })
export class ThemeModeService implements OnDestroy {

  public readonly config = inject(ConfigService);
  public readonly pubSub = inject(PubSubService);

  public readonly activeTheme: WritableSignal<ActiveTheme>;
  public readonly themeSetting: WritableSignal<ThemeSetting>;
  public readonly darkMode = computed(() => this.activeTheme() === 'dark');

  protected readonly darkColorSchemaMediaQuery: MediaQueryList;

  protected readonly subscriptions: Subscription | null = null;
  protected readonly mediaQueryListener: (this: MediaQueryList, ev: MediaQueryListEventMap['change']) => any;

  protected syncSubscription?: Subscription;

  constructor(
    protected readonly mediaMatcher: MediaMatcher,
    @Inject(DOCUMENT) protected readonly document: Document,
  ) {
    this.darkColorSchemaMediaQuery = this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
    this.themeSetting = signal(this.restoreThemeSetting());
    let activeTheme: ActiveTheme;
    const themeSetting = this.themeSetting();
    switch (themeSetting) {
      case 'system':
        activeTheme = this.darkColorSchemaMediaQuery.matches ? 'dark' : 'light';
        break;
      case 'light':
        activeTheme =  'light';
        break;
      case 'dark':
        activeTheme =  'dark';
        break;
      default:
        activeTheme = this.config.get('theme.active', 'light');
        break;
    }
    this.activeTheme = signal(activeTheme);
    effect(() => {
      const setting = this.themeSetting();
      this.storeThemeSetting(setting);
    });
    effect(() => {
      const active = this.activeTheme();
      this.setThemeClasses(active);
    });
    this.mediaQueryListener = (event: MediaQueryListEventMap['change']) => {
      if (this.themeSetting() === 'system') {
        this.activeTheme.set(event.matches ? 'dark' : 'light');
      }
    };
    this.darkColorSchemaMediaQuery.addEventListener('change', this.mediaQueryListener);
    this.restoreFromPubSub();
  }

  private get darkModeLocalStorageKey() {
    return (
             window as any
           )?.['__rxap__']?.['ngx']?.['theme']?.['darkMode']?.['key'] ?? THEME_SETTING_KEY;
  }

  protected restoreFromPubSub() {
    if (this.syncSubscription) {
      return;
    }
    this.syncSubscription = new Subscription();
    this.syncSubscription.add(this.pubSub.subscribe<boolean>(RXAP_TOPICS.theme.darkMode.restore).pipe(
      debounceTime(1000),
      map(event => event.data),
      isDefined(),
      tap(data => {
        const active = data ? 'dark' : 'light';
        this.themeSetting.set(active);
        this.activeTheme.set(active);
      })
    ).subscribe());
  }

  /**
   * Cleans up subscriptions and event listeners when the service is destroyed.
   */
  ngOnDestroy(): void {
    // Remove the media query listener if it exists.
    this.darkColorSchemaMediaQuery.removeEventListener('change', this.mediaQueryListener);
    // Unsubscribe from all RxJS subscriptions.
    this.subscriptions?.unsubscribe();
    this.syncSubscription?.unsubscribe();
  }

  protected restoreThemeSetting() {
    const setting = localStorage.getItem(this.darkModeLocalStorageKey) ?? this.config.get('theme.setting', 'system');
    if (setting && ['system', 'dark', 'light'].includes(setting)) {
      return setting as ThemeSetting;
    }
    return 'system';
  }

  protected storeThemeSetting(setting: ThemeSetting) {
    localStorage.setItem(this.darkModeLocalStorageKey, setting);
  }

  protected removeThemeClasses() {
    this.document.body.classList.remove('light');
    this.document.body.classList.remove('dark');
  }

  protected setThemeClasses(active: ActiveTheme) {
    this.document.body.classList.remove(active === 'light' ? 'dark' : 'light');
    this.document.body.classList.add(active);
  }

  /**
   * Toggles the application theme between 'light' and 'dark' modes.
   * It checks the currently active theme and switches to the opposite mode.
   *
   * @return {void} Does not return a value.
   */
  public toggleTheme(): void {
    const currentActive = this.activeTheme();
    // Determine the new setting based on the *currently active* theme.
    const newActive = currentActive === 'light' ? 'dark' : 'light';
    this.themeSetting.set(newActive);
    this.activeTheme.set(newActive);
  }

  /**
   * Sets the active theme for the application and optionally publishes the change.
   *
   * @param {ActiveTheme} active - The theme to be set as active.
   * @param {boolean} [publish=true] - Indicates whether to publish the theme change event.
   * @return {void}
   */
  public setTheme(active: ActiveTheme, publish = true) {
    this.themeSetting.set(active);
    this.activeTheme.set(active);
    if (publish) {
      this.pubSub.publish(RXAP_TOPICS.theme.darkMode.changed, this.darkMode());
    }
  }

}
