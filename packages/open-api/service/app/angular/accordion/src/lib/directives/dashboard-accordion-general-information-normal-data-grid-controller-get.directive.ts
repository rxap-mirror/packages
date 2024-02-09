import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-normal-data-grid-controller-get.remote-method';
import { DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse } from '../responses/dashboard-accordion-general-information-normal-data-grid-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationNormalDataGridControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationNormalDataGridControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
