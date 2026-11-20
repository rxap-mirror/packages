import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-submit-by-id.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-dashboard-controller-submit-by-id.request-body';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationDashboardControllerSubmitByIdRequestBody>> {
}
