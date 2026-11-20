import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  input
} from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapHasWritePermission]',
  standalone: true,
})
export class HasWritePermissionDirective implements OnInit, OnDestroy {
  public readonly identifier = input.required<string>({ alias: "rxapHasWritePermission" });
  @HostBinding('readonly')
  public readonly = false;
  private _subscription?: Subscription;

  constructor(
    @Inject(AuthorizationService)
    private readonly authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
    private readonly scope: string | null = null,
  ) {
  }

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
