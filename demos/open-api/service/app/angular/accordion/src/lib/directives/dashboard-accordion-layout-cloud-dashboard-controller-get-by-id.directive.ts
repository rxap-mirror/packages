import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';

@Directive({
    selector: '[dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>> {
  @Input('dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>;
  @Input('dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
