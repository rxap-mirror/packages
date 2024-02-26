import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDashboardControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
