import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-location-control-table-select-page.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageParameter, void>> {
}
