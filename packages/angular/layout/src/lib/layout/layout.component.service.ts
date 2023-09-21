import { MediaMatcher } from '@angular/cdk/layout';
import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { ConfigService } from '@rxap/config';
import {
  FooterService,
  HeaderService,
} from '@rxap/services';
import {
  BehaviorSubject,
  Observable,
  skip,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';
import { RXAP_LOGO_CONFIG } from '../tokens';
import { LogoConfig } from '../types';

@Injectable({ providedIn: 'root' })
export class LayoutComponentService {

  public opened$: BehaviorSubject<boolean>;
  public mode$: BehaviorSubject<MatDrawerMode>;
  public pinned$: BehaviorSubject<boolean>;
  public fixedBottomGap$: Observable<number>;
  public fixedTopGap$ = new BehaviorSubject<number>(64);
  public logo: LogoConfig;
  public collapsable$: BehaviorSubject<boolean>;


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
    this.mode$ = new BehaviorSubject<MatDrawerMode>(mode);
    this.opened$ = new BehaviorSubject<boolean>(opened);
    this.pinned$ = new BehaviorSubject<boolean>(pinned);
    this.collapsable$ = new BehaviorSubject<boolean>(collapsable);
    this.fixedBottomGap$ = this.footerComponentService.portalCount$.pipe(map(count => count * 64));
    this.fixedTopGap$.next(this.headerComponentService.countComponent * 64);
    this.headerComponentService.update$.pipe(
      tap(() => this.fixedTopGap$.next(this.headerComponentService.countComponent * 64)),
    ).subscribe();
    this.logo = logoConfig ?? {
      src: 'assets/logo.png',
      width: 192,
    };
    mobileQuery.addEventListener('change', (event) => {
      if (initialCollapsable) {
        this.collapsable$.next(!event.matches);
        if (this.collapsable$.value) {
          if (!this.pinned$.value) {
            this.opened$.next(false);
          }
        }
      }
    });
    this.pinned$.pipe(
      skip(1),
      tap(pinned => {
        if (pinned) {
          this.mode$.next('side');
          this.opened$.next(true);
        } else {
          this.mode$.next('over');
          this.opened$.next(false);
        }
      }),
    ).subscribe();
  }

  public toggleOpend() {
    this.opened$.next(!this.opened$.value);
  }

  public togglePinned() {
    this.pinned$.next(!this.pinned$.value);
  }

}
