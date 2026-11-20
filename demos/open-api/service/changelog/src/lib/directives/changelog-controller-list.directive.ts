import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { ChangelogControllerListRemoteMethod } from '../remote-methods/changelog-controller-list.remote-method';
import { ChangelogControllerListResponse } from '../responses/changelog-controller-list.response';

@Directive({
  selector: '[changelogControllerListCollectionRemoteMethod]',
  exportAs: 'changelogControllerListCollectionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerListRemoteMethod } ],
})
export class ChangelogControllerListRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<ChangelogControllerListResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'changelogControllerListCollectionRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'changelogControllerListCollectionRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>>(undefined, { alias: 'changelogControllerListCollectionRemoteMethodError' });
  override readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: 'changelogControllerListCollectionRemoteMethodEmpty' });
}

@Directive({
  selector: '[changelogControllerListRemoteMethod]',
  exportAs: 'changelogControllerListRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerListRemoteMethod } ],
})
export class ChangelogControllerListRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerListResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'changelogControllerListRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'changelogControllerListRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'changelogControllerListRemoteMethodError' });
}

@Directive({
  selector: '[changelogControllerListRemoteMethod]',
  exportAs: 'changelogControllerListRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerListRemoteMethod } ],
})
export class ChangelogControllerListRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerListResponse, OpenApiRemoteMethodParameter<void, void>> {
}
