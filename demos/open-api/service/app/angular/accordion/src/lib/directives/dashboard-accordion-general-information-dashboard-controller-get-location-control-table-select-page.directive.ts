import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
