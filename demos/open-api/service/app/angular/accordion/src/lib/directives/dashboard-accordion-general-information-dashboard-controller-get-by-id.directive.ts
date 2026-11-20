import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-get-by-id.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerGetByIdRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerGetByIdParameter, void>> {
}
