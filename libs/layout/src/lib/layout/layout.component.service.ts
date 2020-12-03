import {
  Injectable,
  Optional,
  Inject
} from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import {
  FooterService,
  HeaderService
} from '@rxap/services';
import { RXAP_LOGO_CONFIG } from '../tokens';
import { LogoConfig } from '../types';

@Injectable({ providedIn: 'root' })
export class LayoutComponentService {

  public opened$      = new BehaviorSubject<boolean>(true);
  public mode$        = new BehaviorSubject<'over' | 'push' | 'side'>('side');
  public fixedBottomGap$: Observable<number>;
  public fixedTopGap$ = new BehaviorSubject<number>(64);
  public logo: LogoConfig;

  public constructor(
    public readonly footerComponentService: FooterService,
    public readonly headerComponentService: HeaderService,
    @Optional() @Inject(RXAP_LOGO_CONFIG) logoConfig: LogoConfig | null = null
  ) {
    this.fixedBottomGap$ = this.footerComponentService.portalCount$.pipe(map(count => count * 64));
    this.fixedTopGap$.next(this.headerComponentService.countComponent * 64);
    this.headerComponentService.update$.pipe(
      tap(() => this.fixedTopGap$.next(this.headerComponentService.countComponent * 64))
    ).subscribe();
    this.logo = logoConfig ?? {
      src:   '/assets/logo.png',
      width: '340'
    };
  }

}
