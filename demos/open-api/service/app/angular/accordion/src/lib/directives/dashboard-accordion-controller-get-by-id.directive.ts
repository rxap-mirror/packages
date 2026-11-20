import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionControllerGetByIdParameter } from '../parameters/dashboard-accordion-controller-get-by-id.parameter';
import { DashboardAccordionControllerGetByIdRemoteMethod } from '../remote-methods/dashboard-accordion-controller-get-by-id.remote-method';
import { DashboardAccordionControllerGetByIdResponse } from '../responses/dashboard-accordion-controller-get-by-id.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionControllerGetByIdRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>>(undefined, { alias: 'dashboardAccordionControllerGetByIdRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionControllerGetByIdRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionControllerGetByIdRemoteMethod]',
  exportAs: 'dashboardAccordionControllerGetByIdRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionControllerGetByIdRemoteMethod } ],
})
export class DashboardAccordionControllerGetByIdRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionControllerGetByIdResponse, OpenApiRemoteMethodParameter<DashboardAccordionControllerGetByIdParameter, void>> {
}
