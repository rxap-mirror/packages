import {
  Injectable,
  Inject
} from '@angular/core';
import {
  HeaderService,
  FooterService
} from '@rxap/services';
import {
  BehaviorSubject,
  Observable,
  combineLatest
} from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SidenavContentComponentService {

  public headerRows$ = new BehaviorSubject<number>(1);
  public footerRows$: Observable<number>;
  public innerHeight$: Observable<string>;
  public marginTop$: Observable<string>;
  public marginBottom$: Observable<string>;

  constructor(
    @Inject(FooterService) public readonly footerComponentService: FooterService,
    @Inject(HeaderService) public readonly headerComponentService: HeaderService
  ) {
    this.headerRows$.next(this.headerComponentService.countComponent);

    this.footerComponentService.portalCount$.pipe().subscribe();

    this.footerRows$ = this.footerComponentService.portalCount$;

    this.headerComponentService.update$.pipe(
      tap(() => this.headerRows$.next(this.headerComponentService.countComponent))
    ).subscribe();

    this.innerHeight$ = combineLatest([
      this.headerRows$,
      this.footerRows$
    ]).pipe(
      map(([ headerRows, footerRows ]) => `calc(100% - ${64 * (headerRows + footerRows)}px)`)
    );

    this.marginTop$ = this.headerRows$.pipe(
      map(headerRows => `${headerRows * 64}px`)
    );

    this.marginBottom$ = this.footerRows$.pipe(
      map(footerRows => `${footerRows * 64}px`)
    );

  }

}
