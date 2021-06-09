import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapIfHasPermission]',
})
export class IfHasPermissionDirective implements OnInit, OnDestroy {
  @Input()
  @Required
  public identifier!: string;

  private _subscription?: Subscription;

  constructor(
    @Inject(AuthorizationService)
    private readonly authorization: AuthorizationService,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<any>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
    private readonly scope: string | null = null
  ) {}

  public ngOnInit() {
    this._subscription = this.authorization
      .hasPermission(this.identifier, this.scope || null)
      .pipe(
        tap((hasPermission) => {
          if (hasPermission) {
            this.viewContainerRef.createEmbeddedView(this.template);
          } else {
            this.viewContainerRef.clear();
          }
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}
