import { MediaMatcher } from '@angular/cdk/layout';
import {
  computed,
  effect,
  Inject,
  Injectable,
  Optional,
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
import { RXAP_LOGO_CONFIG } from '../tokens';
import { LogoConfig } from '../types';

@Injectable({ providedIn: 'root' })
export class LayoutComponentService {

  public logo: LogoConfig;

  public readonly opened: WritableSignal<boolean>;
  public readonly mode: WritableSignal<MatDrawerMode>;
  public readonly pinned: WritableSignal<boolean>;
  public readonly collapsable: WritableSignal<boolean>;
  public readonly fixedBottomGap: Signal<number>;
  public readonly fixedTopGap: Signal<number>;

  private readonly currentThemeDensity = toSignal(ObserveCurrentThemeDensity());


  public constructor(
    public readonly footerComponentService: FooterService,
    public readonly headerComponentService: HeaderService,
    @Optional() @Inject(RXAP_LOGO_CONFIG) logoConfig: LogoConfig | null = null,
    @Inject(ConfigService)
    private readonly config: ConfigService,
    mediaMatcher: MediaMatcher,
  ) {
    const mobileQuery = mediaMatcher.matchMedia('(max-width: 959px)');
    const mobile = mobileQuery.matches;
    const initialCollapsable = this.config.get('navigation.collapsable', true);
    const collapsable = initialCollapsable && !mobile;
    const pinned = this.config.get('navigation.pinned', false);
    const mode = this.config.get('navigation.mode', pinned || !collapsable ? 'side' : 'over');
    const opened = this.config.get('navigation.opened', (!collapsable || pinned) && !mobile);

    this.opened = signal(opened);
    this.mode = signal(mode);
    this.pinned = signal(pinned);
    this.collapsable = signal(collapsable);

    this.fixedBottomGap = computed(() => this.footerComponentService.portalCount() * (
      64 + (
           this.currentThemeDensity() ?? 0
         ) * 4
    ));
    this.fixedTopGap = computed(() => this.headerComponentService.componentCount() * (
      64 + (
           this.currentThemeDensity() ?? 0
         ) * 4
    ));

    this.logo = logoConfig ?? {
      src: 'assets/logo.png',
      width: 192,
    };
    mobileQuery.addEventListener('change', (event) => {
      if (initialCollapsable) {
        this.collapsable.set(!event.matches);
        if (this.collapsable()) {
          if (!this.pinned()) {
            this.opened.set(false);
          }
        }
      }
    });
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
