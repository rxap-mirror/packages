import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter } from '../parameters/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.parameter';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod } from '../remote-methods/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.remote-method';
import { DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse } from '../responses/dashboard-accordion-general-information-dashboard-controller-resolve-location-control-value.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod]',
  exportAs: 'dashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethod } ],
})
export class DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueResponse, OpenApiRemoteMethodParameter<DashboardAccordionGeneralInformationDashboardControllerResolveLocationControlValueParameter, void>> {
}
