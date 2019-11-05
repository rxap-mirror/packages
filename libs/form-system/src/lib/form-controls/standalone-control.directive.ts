import {
  Directive,
  Inject,
  OnInit,
  Input
} from '@angular/core';
import { BaseControlComponent } from './base-control.component';
import { RXAP_CONTROL_COMPONENT } from '../tokens';
import {
  BaseFormControl,
  IBaseFormControl
} from '../forms/form-controls/base.form-control';

@Directive({
  selector: '[rxapStandaloneControl]'
})
export class StandaloneControlDirective<ControlValue,
  FormControl extends BaseFormControl<ControlValue>,
  ControlComponent extends BaseControlComponent<ControlValue, FormControl>,
  >
  implements OnInit, IBaseFormControl<ControlValue> {

  @Input() public disabled!: boolean;
  @Input() public initial!: ControlValue;
  @Input() public label!: string;
  @Input() public name!: string;
  @Input() public placeholder!: string;
  @Input() public readonly!: boolean;
  @Input() public required!: boolean;
  public control!: FormControl;

  constructor(@Inject(RXAP_CONTROL_COMPONENT) public controlComponent: ControlComponent) { }

  public ngOnInit(): void {
    this.controlComponent.control = this.buildControl();
  }

  public buildControl(): FormControl {
    return this.control = BaseFormControl.STANDALONE<ControlValue>({
      placeholder: this.placeholder,
      label:       this.label,
      disabled:    this.disabled,
      readonly:    this.readonly,
      required:    this.required,
      name:        this.name,
      initial:     this.initial
    }) as any;
  }

}
