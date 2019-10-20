import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control-component.service';
import { TextareaFormControl } from '../../forms/form-controls/textarea-form.control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';

@RxapComponent(RxapFormControlComponentIds.TEXTAREA)
@Component({
  selector:        'rxap-textarea-control',
  templateUrl:     './textarea-control.component.html',
  styleUrls:       [ './textarea-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaControlComponent
  extends NgModelControlComponent<string, TextareaFormControl> {}
