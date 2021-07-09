import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { AuthorizationService } from '@rxap/authorization';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  tap,
  startWith,
  map
} from 'rxjs/operators';
import { HasAuthorizationDirectiveFormParameters } from './has-authorization-directive.form';
import { FormDirective } from '@rxap/forms';

@Component({
  selector:        'rxap-has-authorization-directive',
  templateUrl:     './has-authorization-directive.component.html',
  styleUrls:       [ './has-authorization-directive.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-has-authorization-directive' },
  providers:       [ HasAuthorizationDirectiveFormParameters ]
})
export class HasAuthorizationDirectiveComponent implements OnInit, OnDestroy {

  public authorizationMap: Record<string, boolean> = {};

  private _subscription?: Subscription;

  constructor(public readonly authorization: AuthorizationService) {}

  public ngOnInit() {
    this.authorization.setMap([
      [ 'home.card.product.create', false ],
      [ 'home.card.product.name', false ],
      [ 'user.form.create.gender', false ],
      [ 'user.form.edit.isAdmin', false ],
      [ 'product.form.edit.active', false ]
    ]);
    this.authorizationMap = this.authorization.getMap();
    this._subscription    = this.authorization.change$.pipe(
      tap(() => this.authorizationMap = this.authorization.getMap())
    ).subscribe();
  }

  public ngOnDestroy() {
    this.authorization.clear();
  }

  public update(identifier: string, $event: MatSlideToggleChange): void {
    this.authorization.set(identifier, $event.checked);
  }

  public getStates$(form: FormDirective): Observable<Record<string, any>> {
    return form.form.statusChanges.pipe(
      startWith(null),
      map(() => Object.entries(form.form.controls).map(([ controlId, control ]) => ({
        [ controlId ]: control.disabled
      })).reduce((acc, item) => ({ ...acc, ...item }), {}))
    );
  }

}
