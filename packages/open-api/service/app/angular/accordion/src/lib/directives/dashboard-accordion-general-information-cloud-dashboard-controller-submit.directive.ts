import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
