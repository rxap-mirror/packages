import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DashboardAccordionGeneralInformationDashboardControllerGetParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetParameter, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetParameter, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardControllerGetResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
