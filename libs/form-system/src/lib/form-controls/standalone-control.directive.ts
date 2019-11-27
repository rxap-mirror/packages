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
import {
  ProxyChangeDetection,
  SubscriptionHandler
} from '@rxap/utilities';

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

  public subscriptions = new SubscriptionHandler();

  constructor(
    @Inject(RXAP_CONTROL_COMPONENT) controlComponent: any,
    public injector: Injector
  ) {
    this.controlComponent = controlComponent;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.control) {
      Object.entries(changes).forEach(([ key, value ]) => Reflect.set(this.control, key, value.currentValue));
    }
  }

  public ngOnInit(): void {
    const control = ProxyChangeDetection(this.buildControl());
    control.init();
    control.rxapOnInit();
    this.controlComponent.control = this.control = control;
    if (hasOnSetControlHook(this.controlComponent)) {
      this.controlComponent.rxapOnSetControl();
    }
  }

  public ngOnDestroy(): void {
    this.controlComponent.control.rxapOnDestroy();
    this.subscriptions.unsubscribeAll();
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
