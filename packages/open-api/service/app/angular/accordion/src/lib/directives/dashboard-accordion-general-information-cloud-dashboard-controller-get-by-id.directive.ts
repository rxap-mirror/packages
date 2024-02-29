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
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
