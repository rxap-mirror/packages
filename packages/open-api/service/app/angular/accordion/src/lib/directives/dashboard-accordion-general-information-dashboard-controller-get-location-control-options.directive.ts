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
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.response';

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodTemplateCollectionDirective extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse>>>, @Inject(IterableDiffers) differs: IterableDiffers, @Inject(NgZone) zone: NgZone, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodTemplateDirective extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
    selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod]',
    exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod',
    standalone: true
  })
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodDirective extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod) remoteMethod: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
