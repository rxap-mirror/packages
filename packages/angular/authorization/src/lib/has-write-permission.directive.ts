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
import { Showcase } from '@ng-prism/core';

@Showcase<HasWritePermissionDirective>({
  title: 'Has Write Permission',
  category: 'Authorization',
  description: 'Sets the `readonly` property of the host element if the user does not have the permission. The permission `prism.granted` is granted in the styleguide, `prism.denied` is missing.',
  status: 'stable',
  host: '<input type="text" value="demo">',
  variants: [
    { name: 'Permitted', description: 'The user has the permission, the input is editable.', inputs: { identifier: 'prism.granted' } },
    { name: 'Denied', description: 'The permission is missing, the input is read only.', inputs: { identifier: 'prism.denied' } },
  ],
})
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
