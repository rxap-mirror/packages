import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
