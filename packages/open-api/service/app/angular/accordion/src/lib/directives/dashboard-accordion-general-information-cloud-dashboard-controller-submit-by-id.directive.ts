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
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>> {
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>;
  @Input('dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
