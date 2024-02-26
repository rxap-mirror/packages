import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, IterableDiffers, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateCollectionDirective, RemoteMethodTemplateCollectionDirectiveContext, RemoteMethodTemplateCollectionDirectiveErrorContext, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-controller-get-root.parameter';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';
import { DashboardAccordionReferenceControllerGetRootResponse } from '../responses/dashboard-accordion-reference-controller-get-root.response';

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetRootCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetRootCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetRootRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetRootResponse>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
  @Input('dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>;
  @Input('dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetRootRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionReferenceControllerGetRootResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetRootRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetRootRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetRootRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetRootResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
  @Input('dashboardAccordionReferenceControllerGetRootRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>;
  @Input('dashboardAccordionReferenceControllerGetRootRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetRootRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionReferenceControllerGetRootResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetRootRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetRootRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetRootRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetRootResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetRootRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
