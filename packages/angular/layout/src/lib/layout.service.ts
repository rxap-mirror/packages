import { MediaMatcher } from '@angular/cdk/layout';
import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDrawerMode } from '@angular/material/sidenav';
import { ConfigService } from '@rxap/config';
import { ObserveCurrentThemeDensity } from '@rxap/ngx-theme';
import {
  FooterService,
  HeaderService,
} from '@rxap/services';
import { Observable } from 'rxjs';
import { RXAP_LOGO_CONFIG } from './tokens';

@Injectable({ providedIn: 'root' })
export class LayoutService {

  public readonly logo =signal(inject(RXAP_LOGO_CONFIG, { optional: true }) ?? {
    src: 'assets/logo.png',
    width: 192,
  });
  public readonly opened: WritableSignal<boolean>;
  public readonly mode: WritableSignal<MatDrawerMode>;
  public readonly pinned: WritableSignal<boolean>;
  public readonly collapsable: WritableSignal<boolean>;
  public readonly fixedBottomGap: Signal<number>;
  public readonly fixedTopGap: Signal<number>;
  public readonly currentThemeDensity = toSignal(ObserveCurrentThemeDensity());
  public readonly isMobile: Signal<boolean>;

  public readonly footerComponentService = inject(FooterService);
  public readonly headerComponentService = inject(HeaderService);
  private readonly config = inject(ConfigService);
  private readonly mediaMatcher = inject(MediaMatcher);

  constructor() {
    const mobileQuery = this.mediaMatcher.matchMedia('(max-width: 959px)');
    this.isMobile = toSignal(new Observable<boolean>(subscriber => {
      mobileQuery.addEventListener('change', (event) => {
        subscriber.next(event.matches);
      });
    }), { initialValue: mobileQuery.matches });

    const initialCollapsable = this.config.get('navigation.collapsable', true);
    const collapsable = initialCollapsable && !this.isMobile();
    const pinned = this.config.get('navigation.pinned', false);
    const mode = this.config.get('navigation.mode', pinned || !collapsable ? 'side' : 'over');
    const opened = this.config.get('navigation.opened', (!collapsable || pinned) && !this.isMobile());

    this.opened = signal(opened);
    this.mode = signal(mode);
    this.pinned = signal(pinned);
    this.collapsable = signal(collapsable);

    this.fixedBottomGap = computed(() => {
      const footerPortalCount = this.footerComponentService.portalCount();
      const currentThemeDensity = this.currentThemeDensity() ?? 0;
      return footerPortalCount * (currentThemeDensity * 4 + 64);
    });

    this.fixedTopGap = computed(() => {
      const headerPortalCount = this.headerComponentService.componentCount();
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
    this.opened.set(!this.opened());
  }

  public togglePinned() {
    this.pinned.set(!this.pinned());
  }

}
