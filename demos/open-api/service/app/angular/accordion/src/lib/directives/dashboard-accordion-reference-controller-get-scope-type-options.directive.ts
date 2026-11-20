import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { ArrayElement } from '@rxap/utilities';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } from '../remote-methods/dashboard-accordion-reference-controller-get-scope-type-options.remote-method';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse } from '../responses/dashboard-accordion-reference-controller-get-scope-type-options.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodError' });
  override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodEmpty' });
  override readonly withoutParameters = input(true, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsCollectionRemoteMethodWithoutParameters' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodError' });
  override readonly withoutParameters = input(true, { alias: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodWithoutParameters' });
}

@Directive({
  selector: '[dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod]',
  exportAs: 'dashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } ],
})
export class DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethodDirective
  extends RemoteMethodDirective<DashboardAccordionReferenceControllerGetScopeTypeOptionsResponse, OpenApiRemoteMethodParameter<void, void>> {
}
