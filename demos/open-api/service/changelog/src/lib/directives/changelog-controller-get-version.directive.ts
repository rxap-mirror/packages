import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ChangelogControllerGetVersionParameter } from '../parameters/changelog-controller-get-version.parameter';
import { ChangelogControllerGetVersionRemoteMethod } from '../remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerGetVersionResponse } from '../responses/changelog-controller-get-version.response';

@Directive({
  selector: '[changelogControllerGetVersionRemoteMethod]',
  exportAs: 'changelogControllerGetVersionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerGetVersionRemoteMethod } ],
})
export class ChangelogControllerGetVersionRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerGetVersionResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>>(undefined, { alias: 'changelogControllerGetVersionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'changelogControllerGetVersionRemoteMethodError' });
}

@Directive({
  selector: '[changelogControllerGetVersionRemoteMethod]',
  exportAs: 'changelogControllerGetVersionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerGetVersionRemoteMethod } ],
})
export class ChangelogControllerGetVersionRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerGetVersionResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>> {
}
