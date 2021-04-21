import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  filter,
  tap
} from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector:        'rxap-auth-loading',
  templateUrl:     './loading.component.html',
  styleUrls:       [ './loading.component.scss' ],
  host:            { class: 'rxap-auth-loading' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnInit, OnDestroy {

  public subscription?: Subscription;

  constructor(
    public readonly authentication: RxapAuthenticationService,
    public readonly router: Router
  ) {}

  public ngOnInit(): void {
    // TODO : remove the concept of isAuthenticated$
    if (this.authentication.isAuthenticated$) {
      this.subscription = this.authentication.isAuthenticated$.pipe(
        filter(isAuthenticated => isAuthenticated !== null),
        tap(() => this.router.navigate([ '/', 'authentication', 'login' ]))
      ).subscribe();
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
