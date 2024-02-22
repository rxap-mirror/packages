import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-data-grid-controller-get.remote-method';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-data-grid-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardDataGridControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
