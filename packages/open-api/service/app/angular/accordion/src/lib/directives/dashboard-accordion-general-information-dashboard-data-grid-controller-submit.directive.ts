import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-data-grid-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-data-grid-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardDataGridControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
