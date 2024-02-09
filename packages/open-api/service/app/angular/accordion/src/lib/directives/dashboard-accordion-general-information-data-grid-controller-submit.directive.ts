import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-data-grid-controller-submit.remote-method';
import { DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody } from '../request-bodies/dashboard-accordion-general-information-data-grid-controller-submit.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody>> {
  @Input('dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody>;
  @Input('dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, DashboardAccordionGeneralInformationDataGridControllerSubmitRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDataGridControllerSubmitRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
