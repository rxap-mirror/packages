import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-special-data-grid-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-special-data-grid-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationSpecialDataGridControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
