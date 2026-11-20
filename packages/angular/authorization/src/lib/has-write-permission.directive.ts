import { ChangeDetectorRef, Directive, HostBinding, OnDestroy, OnInit, input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapHasWritePermission]',
  standalone: true,
})
export class HasWritePermissionDirective implements OnInit, OnDestroy {
  private readonly authorization = inject<AuthorizationService>(AuthorizationService);
  protected readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true }) ?? null;

  public readonly identifier = input.required<string>({ alias: "rxapHasWritePermission" });
  @HostBinding('readonly')
  public readonly = false;
  private _subscription?: Subscription;

  public ngOnInit() {
    this._subscription = this.authorization
                             .hasPermission$(this.identifier(), this.scope || null)
                             .pipe(
                               tap((hasPermission) => {
                                 this.readonly = !hasPermission;
                                 this.cdr.markForCheck();
                               }),
                             )
                             .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}
