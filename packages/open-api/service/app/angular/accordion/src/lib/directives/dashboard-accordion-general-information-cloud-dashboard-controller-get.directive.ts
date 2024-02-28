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
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-get.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
