import {
  Directive,
  Inject,
  OnInit,
  Input,
  Injector,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { BaseControlComponent } from './base-control.component';
import { RXAP_CONTROL_COMPONENT } from '../tokens';
import {
  BaseFormControl,
  IBaseFormControl
} from '../forms/form-controls/base.form-control';
import { hasOnSetControlHook } from '../form-view/hooks';
import { ProxyChangeDetection } from '@rxap/utilities';

@Directive({
  selector: '[rxapStandaloneControl]'
})
export class StandaloneControlDirective<ControlValue,
  FormControl extends BaseFormControl<ControlValue>,
  ControlComponent extends BaseControlComponent<ControlValue, FormControl>,
  >
  implements OnInit, IBaseFormControl<ControlValue>, OnChanges, OnDestroy {

  @Input() public disabled!: boolean;
  @Input() public initial!: ControlValue;
  @Input() public label!: string;
  @Input() public name!: string;
  @Input() public placeholder!: string;
  @Input() public readonly!: boolean;
  @Input() public required!: boolean;
  public control!: FormControl;
  public controlComponent: ControlComponent;

  constructor(
    @Inject(RXAP_CONTROL_COMPONENT) controlComponent: any,
    public injector: Injector
  ) {
    this.controlComponent = controlComponent;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.control) {
      console.log('d cahnge', changes);
      Object.entries(changes).forEach(([ key, value ]) => Reflect.set(this.control, key, value.currentValue));
      console.log(this.control);
    }
  }

  public ngOnInit(): void {
    this.controlComponent.control = this.control = ProxyChangeDetection(this.buildControl());
    this.controlComponent.control.init();
    this.controlComponent.control.rxapOnInit();
    if (hasOnSetControlHook(this.controlComponent)) {
      this.controlComponent.rxapOnSetControl();
    }
  }

  public ngOnDestroy(): void {
    this.controlComponent.control.rxapOnDestroy();
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
