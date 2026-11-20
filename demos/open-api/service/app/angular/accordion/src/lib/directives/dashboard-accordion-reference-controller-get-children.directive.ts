import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetChildrenParameter } from '../parameters/dashboard-accordion-reference-controller-get-children.parameter';
import { DashboardAccordionReferenceControllerGetChildrenRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-children.remote-method';
import { DashboardAccordionReferenceControllerGetChildrenResponse } from '../responses/dashboard-accordion-reference-controller-get-children.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetChildrenRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetChildrenResponse>, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodError' });
  override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetChildrenCollectionRemoteMethodEmpty' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetChildrenRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetChildrenRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethodError' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetChildrenRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetChildrenRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetChildrenRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetChildrenRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetChildrenResponse, OpenApiRemoteMethodParameter<DashboardAccordionReferenceControllerGetChildrenParameter, void>> {
}
