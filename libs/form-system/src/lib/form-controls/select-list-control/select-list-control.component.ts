import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  Input,
  forwardRef
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control.component';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import {
  MatSelectionList,
  MatListOption
} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { IconConfig } from '@rxap/utilities';
import { SelectListFormControl } from '../../forms/form-controls/select-list.form-control';
import { RXAP_CONTROL_COMPONENT } from '../../tokens';
import { BaseControlComponent } from '../base-control.component';


@RxapComponent(RxapFormControlComponentIds.SELECT_LIST)
@Component({
  selector:        'rxap-select-list-control',
  templateUrl:     './select-list-control.component.html',
  styleUrls:       [ './select-list-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => RxapSelectListControlComponent)
    },
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => RxapSelectListControlComponent)
    },
    {
      provide:     NgModelControlComponent,
      useExisting: forwardRef(() => RxapSelectListControlComponent)
    }
  ],
  inputs:          [ 'control' ]
})
export class RxapSelectListControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectListFormControl<ControlValue>>
  implements OnInit {

  @Input() public icon: string | IconConfig | null = null;

  @ViewChild(MatSelectionList, { static: true }) public selectionList!: MatSelectionList;

  public ngOnInit(): void {
    this.selectionList.selectedOptions = new SelectionModel<MatListOption>(false);
  }

}
