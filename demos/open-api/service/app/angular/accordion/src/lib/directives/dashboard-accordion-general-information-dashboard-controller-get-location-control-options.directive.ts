import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-options.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodError' });
  override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodEmpty' });
  override readonly withoutParameters = input(true, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsCollectionRemoteMethodWithoutParameters' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodError' });
  override readonly withoutParameters = input(true, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodWithoutParameters' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
}
