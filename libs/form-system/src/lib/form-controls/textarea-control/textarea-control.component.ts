import {
  Component,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { TextareaFormControl } from '../../forms/form-controls/textarea-form.control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.TEXTAREA)
@Component({
  selector:        'rxap-textarea-control',
  templateUrl:     './textarea-control.component.html',
  styleUrls:       [ './textarea-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs:        'rxapTextareaControl',
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapTextareaControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapTextareaControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapTextareaControlComponent)
    }
  ]
})
export class RxapTextareaControlComponent
  extends NgModelControlComponent<string, TextareaFormControl> {}
