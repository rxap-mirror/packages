import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
  styleUrls: [ './loading.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ MatProgressBarModule ],
})
export class LoadingComponent implements OnInit, OnDestroy {
  public subscription?: Subscription;

  constructor(
    @Inject(RxapAuthenticationService)
    public readonly authentication: RxapAuthenticationService,
    @Inject(Router)
    public readonly router: Router,
  ) {
  }

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
