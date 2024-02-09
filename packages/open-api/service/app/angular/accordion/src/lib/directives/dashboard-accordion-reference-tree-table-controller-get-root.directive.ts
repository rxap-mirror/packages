import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, IterableDiffers, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateCollectionDirective, RemoteMethodTemplateCollectionDirectiveContext, RemoteMethodTemplateCollectionDirectiveErrorContext, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod } from '../remote-methods/dashboard-accordion-reference-tree-table-controller-get-root.remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-root.response';

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetRootCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetRootCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceTreeTableControllerGetRootResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionReferenceTreeTableControllerGetRootCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetRootCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetRootCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionReferenceTreeTableControllerGetRootResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionReferenceTreeTableControllerGetRootResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionReferenceTreeTableControllerGetRootResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionReferenceTreeTableControllerGetRootResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetRootRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
