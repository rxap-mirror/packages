import {
  Input,
  Injectable,
  OnDestroy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import {
  Required,
  SubscriptionHandler
} from '@rxap/utilities';
import { tap } from 'rxjs/operators';

@Injectable()
export class BaseControlComponent<ControlValue,
  FormControl extends BaseFormControl<ControlValue>>
  implements OnDestroy, OnInit {

  @Input() @Required public control!: FormControl;

  public subscriptions = new SubscriptionHandler();

  constructor(public changeDetectorRef: ChangeDetectorRef) {

  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.control.updateView$.pipe(
        tap(() => this.changeDetectorRef.markForCheck())
      ).subscribe()
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }

}
