import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-general-information-cloud-dashboard-controller-get-by-id.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationCloudDashboardControllerGetByIdParameter, void>> {
}
