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
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-submit-by-id.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit-by-id.request-body';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodDirective extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
