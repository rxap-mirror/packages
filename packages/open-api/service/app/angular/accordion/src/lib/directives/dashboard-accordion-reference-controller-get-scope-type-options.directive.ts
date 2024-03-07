import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  Input,
  IterableDiffers,
  NgZone,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveContext,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-scope-type-options.remote-method';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse } from '../responses/dashboard-accordion-reference-controller-get-scope-type-options.response';

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod]',
    exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod',
    standalone: true
  })
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod) remoteMethod: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
