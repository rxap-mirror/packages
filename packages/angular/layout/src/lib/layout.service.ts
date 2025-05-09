import { MediaMatcher } from '@angular/cdk/layout';
import {
  computed,
  effect,
  Inject,
  inject,
  Injectable,
  isDevMode,
  Optional,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDrawerMode } from '@angular/material/sidenav';
import {
  ConfigService,
  NavigationConfig,
} from '@rxap/config';
import { ObserveCurrentThemeDensity } from '@rxap/ngx-theme';
import { Observable } from 'rxjs';
import { FooterService } from './footer.service';
import { HeaderService } from './header.service';
import { RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS } from './tokens';

@Injectable()
export class LayoutService {

  public readonly opened: WritableSignal<boolean>;
  public readonly mode: WritableSignal<MatDrawerMode>;
  public readonly pinned: WritableSignal<boolean>;
  public readonly collapsable: WritableSignal<boolean>;
  public readonly fixedBottomGap: Signal<number>;
  public readonly fixedTopGap: Signal<number>;
  public readonly currentThemeDensity = toSignal(ObserveCurrentThemeDensity());
  public readonly isMobile: Signal<boolean>;
  public readonly fixedInViewport: WritableSignal<boolean>;
  public readonly collapsed: Signal<boolean>;

  private readonly footerService = inject(FooterService);
  private readonly headerService = inject(HeaderService);
  private readonly config = inject(ConfigService);
  private readonly mediaMatcher = inject(MediaMatcher);

  constructor(
    @Inject(RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS)
    @Optional()
    navigationConfigDefaults: Omit<NavigationConfig, 'apps'> | null = null,
  ) {
    const mobileQuery = this.mediaMatcher.matchMedia(navigationConfigDefaults?.mobileQuery ?? '(max-width: 959px)');
    this.isMobile = toSignal(new Observable<boolean>(subscriber => {
      mobileQuery.addEventListener('change', (event) => {
        subscriber.next(event.matches);
      });
    }), { initialValue: mobileQuery.matches });

    const initialCollapsable = this.config.get('navigation.collapsable', navigationConfigDefaults?.collapsable ?? true);
    const collapsable = initialCollapsable && !this.isMobile();
    const pinned = this.config.get('navigation.pinned', navigationConfigDefaults?.pinned ?? false);
    const mode = this.config.get('navigation.mode', navigationConfigDefaults?.mode ?? (pinned || !collapsable ? 'side' : 'over'));
    const opened = this.config.get('navigation.opened', (navigationConfigDefaults?.opened ?? (!collapsable || pinned)) && !this.isMobile());
    const fixedInViewport = this.config.get('navigation.fixedInViewport', navigationConfigDefaults?.fixedInViewport ?? true);

    if (isDevMode()) {
      console.log({
        initialCollapsable,
        collapsable,
        pinned,
        mode,
        opened,
        fixedInViewport,
      });
    }

    this.opened = signal(opened);
    this.mode = signal(mode);
    this.pinned = signal(pinned);
    this.collapsable = signal(collapsable);
    this.fixedInViewport = signal(fixedInViewport);
    this.collapsed = computed(() => this.collapsable() && !this.opened() && !this.pinned());

    this.fixedBottomGap = computed(() => {
      const footerPortalCount = this.footerService.portalCount();
      const currentThemeDensity = this.currentThemeDensity() ?? 0;
      return footerPortalCount * (currentThemeDensity * 4 + 64);
    });

    this.fixedTopGap = computed(() => {
      const headerPortalCount = this.headerService.portalCount();
      const currentThemeDensity = this.currentThemeDensity() ?? 0;
      return headerPortalCount * (currentThemeDensity * 4 + 64);
    });

    if (initialCollapsable) {
      effect(() => {
        const isMobile = this.isMobile();
        this.collapsable.set(!isMobile);
        if (!isMobile && !this.pinned()) {
          this.opened.set(false);
        }
      }, { allowSignalWrites: true });
    }
    effect(() => {
      if (this.pinned()) {
        this.mode.set('side');
        this.opened.set(true);
      } else {
        this.mode.set('over');
        this.opened.set(false);
      }
    }, { allowSignalWrites: true });
  }

  public toggleOpened() {
    this.opened.update(opened => !opened);
  }

  public togglePinned() {
    this.pinned.update(pinned => !pinned);
  }

  openSidenav() {
    this.opened.set(true);
  }

  closeSidenav() {
    this.opened.set(false);
  }
}
