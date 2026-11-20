import { ChangeDetectorRef, Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef, input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapIfHasPermission]',
  standalone: true,
})
export class IfHasPermissionDirective implements OnInit, OnDestroy {
  private readonly authorization = inject<AuthorizationService>(AuthorizationService);
  private readonly template = inject<TemplateRef<any>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true }) ?? null;


  public readonly identifier = input.required<string>({ alias: "rxapIfHasPermission" });

  public readonly else = input<TemplateRef<any>>(undefined, { alias: "rxapIfHasPermissionElse" });

  private _subscription?: Subscription;

  public ngOnInit() {
    this._subscription = this.authorization
                             .hasPermission$(this.identifier(), this.scope || null)
                             .pipe(
                               distinctUntilChanged(),
                               tap((hasPermission) => {
                                 this.viewContainerRef.clear();
                                 const else = this.else();
                                 if (hasPermission) {
                                   this.viewContainerRef.createEmbeddedView(this.template);
                                 } else if (else) {
                                   this.viewContainerRef.createEmbeddedView(else);
                                 }
                                 this.cdr.markForCheck();
                               }),
                             )
                             .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}
