import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  Input
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control.component';
import {
  SelectFormControl,
  RxapSelectControl
} from '../../forms/form-controls/select.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { TextFilterService } from '../../utilities/text-filter/text-filter.service';
import { OptionTextFilterService } from '../../utilities/text-filter/option-text-filter.service';
import {
  MatSelectionList,
  MatListOption
} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { IconConfig } from '@rxap/utilities';

export function RxapSelectListControl() {
  return function(target: any, propertyKey: string) {
    RxapSelectControl()(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_LIST)(target, propertyKey);
  };
}

@RxapComponent(RxapFormControlComponentIds.SELECT_LIST)
@Component({
  selector:        'rxap-select-list-control',
  templateUrl:     './select-list-control.component.html',
  styleUrls:       [ './select-list-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    {
      provide:  TextFilterService,
      useClass: OptionTextFilterService
    }
  ]
})
export class SelectListControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectFormControl<ControlValue>>
  implements OnInit {

  @Input() public icon: string | IconConfig | null = null;

  @ViewChild(MatSelectionList, { static: true }) public selectionList!: MatSelectionList;

  public ngOnInit(): void {
    this.selectionList.selectedOptions = new SelectionModel<MatListOption>(false);
  }

}
