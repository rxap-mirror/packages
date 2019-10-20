import {
  Input,
  Injectable,
  OnDestroy
} from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { Subscription } from 'rxjs';

@Injectable()
export class BaseControlComponent<ControlValue,
  FormControl extends BaseFormControl<ControlValue>>
  implements OnDestroy {

  @Input() public control!: FormControl;

  public subscriptions = new Subscription();

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
