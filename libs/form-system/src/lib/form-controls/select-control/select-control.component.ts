import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  QueryList,
  ContentChildren,
  AfterContentInit,
  ElementRef
} from '@angular/core';
import { SelectFormControl } from '../../forms/form-controls/select.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';

@RxapComponent(RxapFormControlComponentIds.SELECT)
@Component({
  selector:        'rxap-select-control',
  templateUrl:     './select-control.component.html',
  styleUrls:       [ './select-control.component.scss' ],
  exportAs:        'rxapSelectControl',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapSelectControlComponent)
    }
  ]
})
export class RxapSelectControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectFormControl<ControlValue>> implements AfterContentInit {

  @ContentChildren('option') public options!: QueryList<ElementRef<HTMLOptionElement>>;

  public ngAfterContentInit(): void {
    this.options.forEach(option => {
      const nativeElement = option.nativeElement;
      let value: any      = nativeElement.value;
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      }
      if (!isNaN(Number(value))) {
        value = Number(value);
      }
      this.control.addOption({ value: value, display: nativeElement.textContent } as any);
    });
  }

}
