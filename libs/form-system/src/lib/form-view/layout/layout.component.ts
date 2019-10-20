import {
  Component,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Control } from '../control';
import { ControlContainerComponent } from '../control-container/control-container.component';
import { Layout } from '../layout';
import { Stepper } from '../stepper';
import { StepperComponent } from '../stepper/stepper.component';
import { Required } from '@rxap/utilities';

@Component({
  selector: 'rxap-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent implements OnInit, OnChanges {

  @Input() @Required public layout!: Layout;

  @ViewChild('rowContainer', { static: true, read: ViewContainerRef }) public rowContainer!: ViewContainerRef;

  public layoutFactory  = this.cfr.resolveComponentFactory(LayoutComponent);
  public controlFactory = this.cfr.resolveComponentFactory(ControlContainerComponent);
  public stepperFactory = this.cfr.resolveComponentFactory(StepperComponent);

  constructor(
    public readonly cfr: ComponentFactoryResolver,
    public readonly injector: Injector,
  ) {}

  ngOnInit(): void {

    this.buildComponents(this.layout);

  }

  ngOnChanges(changes: SimpleChanges): void {
    const layoutChange = changes.layout;
    if (layoutChange && !layoutChange.firstChange) {
      this.clear();
      this.buildComponents(layoutChange.currentValue);
    }
  }

  public buildComponents(layout: Layout) {
    for (const component of layout.components) {
      if (component instanceof Layout) {
        this.addLayout(component);
      }
      if (component instanceof Control) {
        this.addControlContainer(component);
      }
      if (component instanceof Stepper) {
        this.addStepper(component);
      }
    }
  }

  public clear(): void {
    this.rowContainer.clear();
  }

  public addLayout(layout: Layout): void {
    const layoutComponent           = this.layoutFactory.create(this.injector);
    layoutComponent.instance.layout = layout;
    this.rowContainer.insert(layoutComponent.hostView);
  }

  public addControlContainer(control: Control): void {
    const controlComponent = this.controlFactory.create(this.injector);
    controlComponent.instance.control = control;
    this.rowContainer.insert(controlComponent.hostView);
  }

  public addStepper(stepper: Stepper): void {
    const stepperComponent = this.stepperFactory.create(this.injector);
    stepperComponent.instance.stepper = stepper;
    this.rowContainer.insert(stepperComponent.hostView);
  }

}
