import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';
import { SettingsControllerGetPropertyRemoteMethod } from '../remote-methods/settings-controller-get-property.remote-method';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';

@Directive({
  selector: '[settingsControllerGetPropertyRemoteMethod]',
  exportAs: 'settingsControllerGetPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerGetPropertyRemoteMethod } ],
})
export class SettingsControllerGetPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerGetPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>>(undefined, { alias: 'settingsControllerGetPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerGetPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerGetPropertyRemoteMethod]',
  exportAs: 'settingsControllerGetPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerGetPropertyRemoteMethod } ],
})
export class SettingsControllerGetPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerGetPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>> {
}
