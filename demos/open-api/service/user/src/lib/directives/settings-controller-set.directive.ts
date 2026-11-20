import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerSetRemoteMethod } from '../remote-methods/settings-controller-set.remote-method';
import { SettingsControllerSetRequestBody } from '../request-bodies/settings-controller-set.request-body';

@Directive({
  selector: '[settingsControllerSetRemoteMethod]',
  exportAs: 'settingsControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerSetRemoteMethod } ],
})
export class SettingsControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>>(undefined, { alias: 'settingsControllerSetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'settingsControllerSetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerSetRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerSetRemoteMethod]',
  exportAs: 'settingsControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerSetRemoteMethod } ],
})
export class SettingsControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>> {
}
