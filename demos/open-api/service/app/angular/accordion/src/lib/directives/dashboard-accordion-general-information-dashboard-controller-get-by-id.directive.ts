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
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
