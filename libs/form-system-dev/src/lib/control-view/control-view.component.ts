import {
  Component,
  OnInit,
  Input,
  OnDestroy
} from '@angular/core';
import {
  BaseFormControl,
  BaseForm
} from '@rxap/form-system';
import { Required } from '@rxap/utilities';
import {
  Observable,
  Subscription
} from 'rxjs';
import { tap } from 'rxjs/operators';

export const IGNORED_TYPES = [
  Observable,
  BaseForm
];

export const IGNORED_PROPERTIES = [
  'parent',
  'root',
  'errorStateMatcher',
  '_subscriptions',
  'injector',
  'providers'
];

@Component({
  selector:    'rxap-control-view',
  templateUrl: './control-view.component.html',
  styleUrls:   [ './control-view.component.scss' ]
})
export class ControlViewComponent implements OnInit, OnDestroy {

  public controlView: any = null;

  @Input() @Required public control!: BaseFormControl<any>;

  @Input() public ignoredTypes: any[]         = [];
  @Input() public ignoredProperties: string[] = [];

  private _subscription = new Subscription();

  public ngOnInit() {
    this.update();
    this._subscription.add(this.control.updateView$.pipe(
      tap(() => this.update())
    ).subscribe());
  }

  public update() {
    this.controlView = Object
      .entries(this.control)
      .filter(([ key, value ]) => [ ...IGNORED_TYPES, ...this.ignoredTypes ].every(type => !(value instanceof type)))
      .filter(([ key, value ]) => ![ ...IGNORED_PROPERTIES, ...this.ignoredProperties ].includes(key))
      .sort((a, b) => a[ 0 ].localeCompare(b[ 0 ]))
      .reduce((controlView, [ key, value ]) => ({ ...controlView, [ key ]: value }), {});
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
