import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter } from '../parameters/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.parameter';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.remote-method';
import { DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse } from '../responses/dashboard-accordion-layout-cloud-dashboard-controller-get-by-id.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>>(undefined, { alias: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionLayoutCloudDashboardControllerGetByIdRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionLayoutCloudDashboardControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionLayoutCloudDashboardControllerGetByIdParameter, void>> {
}
