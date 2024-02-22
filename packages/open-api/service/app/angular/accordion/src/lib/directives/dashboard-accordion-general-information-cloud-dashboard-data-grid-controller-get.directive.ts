import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardDataGridControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
