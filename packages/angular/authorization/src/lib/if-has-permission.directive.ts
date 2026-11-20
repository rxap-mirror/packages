import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import {
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapIfHasPermission]',
  standalone: true,
})
export class IfHasPermissionDirective {
  private readonly authorization = inject(AuthorizationService);
  private readonly template = inject<TemplateRef<any>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true }) ?? null;

  public readonly identifier = input.required<string>({ alias: 'rxapIfHasPermission' });

  public readonly else = input<TemplateRef<any> | undefined>(undefined, { alias: 'rxapIfHasPermissionElse' });

  private readonly hasPermission = toSignal(
    toObservable(this.identifier).pipe(
      switchMap(identifier => this.authorization.hasPermission$(identifier, this.scope)),
      distinctUntilChanged(),
    ),
  );

  constructor() {
    effect(() => {
      const hasPermission = this.hasPermission();
      const elseTemplate = this.else();
      if (hasPermission === undefined) {
        return;
      }
      untracked(() => {
        this.viewContainerRef.clear();
        if (hasPermission) {
          this.viewContainerRef.createEmbeddedView(this.template);
        } else if (elseTemplate) {
          this.viewContainerRef.createEmbeddedView(elseTemplate);
        }
      });
    });
  }
}
