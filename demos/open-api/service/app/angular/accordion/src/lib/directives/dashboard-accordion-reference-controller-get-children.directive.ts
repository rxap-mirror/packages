import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, IterableDiffers, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateCollectionDirective, RemoteMethodTemplateCollectionDirectiveContext, RemoteMethodTemplateCollectionDirectiveErrorContext, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-controller-get-children.parameter';
import { DashboardAccordionReferenceControllerGetChildrenRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-children.remote-method';
import { DashboardAccordionReferenceControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-controller-get-children.response';

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetChildrenResponse>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
  @Input('dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>;
  @Input('dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetChildrenRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionReferenceControllerGetChildrenResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetChildrenRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
  @Input('dashboardAccordionReferenceControllerGetChildrenRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>;
  @Input('dashboardAccordionReferenceControllerGetChildrenRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetChildrenRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionReferenceControllerGetChildrenResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetChildrenRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetChildrenRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
