import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionControllerGetByIdParameter } from '../parameters/dashboard-accordion-controller-get-by-id.parameter';
import { DashboardAccordionControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-controller-get-by-id.remote-method';
import { DashboardAccordionControllerGetByIdResponse } from '../responses/dashboard-accordion-controller-get-by-id.response';

@Directive({
    selector: '[dashboardAccordionControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionControllerGetByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>> {
  @Input('dashboardAccordionControllerGetByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>;
  @Input('dashboardAccordionControllerGetByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionControllerGetByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionControllerGetByIdResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionControllerGetByIdRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionControllerGetByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
