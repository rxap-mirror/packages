import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody } from '../request-bodies/dashboard-accordion-general-information-cloud-dashboard-controller-submit-by-id.request-body';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>>(undefined, { alias: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdParameter, DashboardAccordionGeneralInformationCloudDashboardControllerSubmitByIdRequestBody>> {
}
