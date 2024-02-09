import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-data-grid-controller-get.remote-method';
import { DashboardAccordionGeneralInformationDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-data-grid-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDataGridControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDataGridControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
