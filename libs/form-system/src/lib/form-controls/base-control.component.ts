import {
  Input,
  Injectable,
  OnDestroy
} from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import {
  Required,
  SubscriptionHandler
} from '@rxap/utilities';

@Injectable()
export class BaseControlComponent<ControlValue,
  FormControl extends BaseFormControl<ControlValue>>
  implements OnDestroy {

  @Input() @Required public control!: FormControl;

  public subscriptions = new SubscriptionHandler();

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }

}
