import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ComponentFactoryResolver,
  Injector,
  ViewChild,
  ViewContainerRef,
  isDevMode
} from '@angular/core';
import { Control } from '../control';
import { BaseFormControl } from '../../forms/form-controls/base.form-control';
import { FormStateManager } from '../../form-state-manager';
import { ComponentRegistryService } from '@rxap/component-system';
import { BaseControlComponent } from '../../form-controls/base-control.component';
import { hasOnSetControlHook } from '../hooks';

@Component({
  selector: 'rxap-control-container',
  templateUrl: './control-container.component.html',
  styleUrls: ['./control-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ControlContainerComponent implements OnInit {

  @ViewChild('controlContainer', { static: true, read: ViewContainerRef }) public controlContainer!: ViewContainerRef;

  public control!: Control;

  public formControl!: BaseFormControl<any>;

  public isDevMode = isDevMode();

  constructor(
    public readonly formStateManager: FormStateManager,
    public readonly componentFactoryResolver: ComponentFactoryResolver,
    public readonly componentRegistry: ComponentRegistryService,
    public readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.formControl = this.formStateManager.getForm(this.control.controlPath);

    const componentId = this.control.componentId || this.formControl.componentId;

    if (!componentId) {
      throw new Error('Component id is not defined');
    }

    const component = this.componentRegistry.get(componentId);

    const componentFactory = this
      .componentFactoryResolver
      .resolveComponentFactory<BaseControlComponent<any, any>>(component);

    const injector = Injector.create({
      parent:    this.injector,
      providers: this.formControl.providers
    });

    const componentRef = componentFactory.create(injector);

    componentRef.instance.control = this.formControl;

    if (hasOnSetControlHook(componentRef.instance)) {
      componentRef.instance.rxapOnSetControl();
    }

    this.controlContainer.insert(componentRef.hostView);

  }

}
