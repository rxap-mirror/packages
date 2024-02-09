import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-special-data-grid-controller-get.remote-method';
import { DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-special-data-grid-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationSpecialDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationSpecialDataGridControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
