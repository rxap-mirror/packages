import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { DashboardAccordionLayoutControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-controller-get-by-id.parameter';
import { DashboardAccordionLayoutControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-layout-controller-get-by-id.remote-method';
import { DashboardAccordionLayoutControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-controller-get-by-id.response';

@Directive({
    selector: '[dashboardAccordionLayoutControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionLayoutControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionLayoutControllerGetByIdRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionLayoutControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutControllerGetByIdParameter, void>> {
  @Input('dashboardAccordionLayoutControllerGetByIdRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionLayoutControllerGetByIdParameter, void>;
  @Input('dashboardAccordionLayoutControllerGetByIdRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionLayoutControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionLayoutControllerGetByIdRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionLayoutControllerGetByIdResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionLayoutControllerGetByIdRemoteMethod]',
    exportAs: 'dashboardAccordionLayoutControllerGetByIdRemoteMethod',
    standalone: true
  })
export class DashboardAccordionLayoutControllerGetByIdRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionLayoutControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutControllerGetByIdParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionLayoutControllerGetByIdRemoteMethod) remoteMethod: DashboardAccordionLayoutControllerGetByIdRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
