import { ChangeDetectorRef, Directive, INJECTOR, Inject, Injector, Input, IterableDiffers, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective, RemoteMethodTemplateCollectionDirective, RemoteMethodTemplateCollectionDirectiveContext, RemoteMethodTemplateCollectionDirectiveErrorContext, RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-tree-table-controller-get-children.parameter';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod } from '../remote-methods/dashboard-accordion-reference-tree-table-controller-get-children.remote-method';
import { DashboardAccordionReferenceTreeTableControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-tree-table-controller-get-children.response';

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetChildrenCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetChildrenCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>> {
  @Input('dashboardAccordionReferenceTreeTableControllerGetChildrenCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetChildrenCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetChildrenCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>> {
  @Input('dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>;
  @Input('dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionReferenceTreeTableControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceTreeTableControllerGetChildrenParameter, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod) remoteMethod: DashboardAccordionReferenceTreeTableControllerGetChildrenRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
