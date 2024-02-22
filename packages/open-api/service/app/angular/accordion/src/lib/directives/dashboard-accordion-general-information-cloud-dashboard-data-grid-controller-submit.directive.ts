import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-data-grid-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardDataGridControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
