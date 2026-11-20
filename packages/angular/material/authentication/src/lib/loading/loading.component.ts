import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { RxapAuthenticationService } from '@rxap/authentication';
import { Subscription } from 'rxjs';
import {
  filter,
  tap,
} from 'rxjs/operators';

@Component({
    selector: 'rxap-auth-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatProgressBarModule]
})
export class LoadingComponent implements OnInit, OnDestroy {
  readonly authentication = inject<RxapAuthenticationService>(RxapAuthenticationService);
  readonly router = inject<Router>(Router);

  public subscription?: Subscription;

  public ngOnInit(): void {
    // TODO : remove the concept of isAuthenticated$
    if (this.authentication.isAuthenticated$) {
      this.subscription = this.authentication.isAuthenticated$
        .pipe(
          filter((isAuthenticated) => isAuthenticated !== null),
          tap(() => this.router.navigate([ '/', 'authentication', 'login' ])),
        )
        .subscribe();
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
