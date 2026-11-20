import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetRootParameter } from '../parameters/dashboard-accordion-reference-controller-get-root.parameter';
import { DashboardAccordionReferenceControllerGetRootRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-root.remote-method';
import { DashboardAccordionReferenceControllerGetRootResponse } from '../responses/dashboard-accordion-reference-controller-get-root.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetRootCollectionRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetRootCollectionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetRootRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetRootRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetRootResponse>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodError' });
  override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetRootCollectionRemoteMethodEmpty' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetRootRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetRootRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetRootRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetRootRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetRootResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetRootRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetRootRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetRootRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetRootRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetRootRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetRootRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetRootResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetRootParameter, void>> {
}
