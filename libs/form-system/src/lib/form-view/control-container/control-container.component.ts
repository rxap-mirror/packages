import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit
} from '@angular/core';
import { Control } from '../control';
import { BaseFormControl } from '../../forms/form-controls/base.form-control';
import { FormStateManager } from '../../form-state-manager';

@Component({
  selector: 'rxap-control-container',
  templateUrl: './control-container.component.html',
  styleUrls: ['./control-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ControlContainerComponent implements OnInit {

  control: Control;

  formControl: BaseFormControl<any>;

  constructor(public readonly formStateManager: FormStateManager) {}

  ngOnInit(): void {
    this.formControl = this.formStateManager.getForm(this.control.controlId);
  }

}
