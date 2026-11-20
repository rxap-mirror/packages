import {
  Directive,
  inject,
  input,
} from '@angular/core';
import {
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Directive({
  selector: '[rxapHasWritePermission]',
  standalone: true,
  host: {
    '[readonly]': 'readonly()',
  },
})
export class HasWritePermissionDirective {
  private readonly authorization = inject(AuthorizationService);
  private readonly scope = inject(RXAP_AUTHORIZATION_SCOPE, { optional: true }) ?? null;

  public readonly identifier = input.required<string>({ alias: 'rxapHasWritePermission' });

  public readonly readonly = toSignal(
    toObservable(this.identifier).pipe(
      switchMap(identifier => this.authorization.hasPermission$(identifier, this.scope)),
      map(hasPermission => !hasPermission),
    ),
    { initialValue: false },
  );
}
