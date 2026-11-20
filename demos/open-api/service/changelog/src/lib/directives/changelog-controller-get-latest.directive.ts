import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ChangelogControllerGetLatestParameter } from '../parameters/changelog-controller-get-latest.parameter';
import { ChangelogControllerGetLatestRemoteMethod } from '../remote-methods/changelog-controller-get-latest.remote-method';
import { ChangelogControllerGetLatestResponse } from '../responses/changelog-controller-get-latest.response';

@Directive({
  selector: '[changelogControllerGetLatestRemoteMethod]',
  exportAs: 'changelogControllerGetLatestRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerGetLatestRemoteMethod } ],
})
export class ChangelogControllerGetLatestRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerGetLatestResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>>(undefined, { alias: 'changelogControllerGetLatestRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'changelogControllerGetLatestRemoteMethodError' });
}

@Directive({
  selector: '[changelogControllerGetLatestRemoteMethod]',
  exportAs: 'changelogControllerGetLatestRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ChangelogControllerGetLatestRemoteMethod } ],
})
export class ChangelogControllerGetLatestRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerGetLatestResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>> {
}
