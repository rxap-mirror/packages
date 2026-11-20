import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';
import { SettingsControllerClearPropertyRemoteMethod } from '../remote-methods/settings-controller-clear-property.remote-method';

@Directive({
  selector: '[settingsControllerClearPropertyRemoteMethod]',
  exportAs: 'settingsControllerClearPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerClearPropertyRemoteMethod } ],
})
export class SettingsControllerClearPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>>(undefined, { alias: 'settingsControllerClearPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerClearPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerClearPropertyRemoteMethod]',
  exportAs: 'settingsControllerClearPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerClearPropertyRemoteMethod } ],
})
export class SettingsControllerClearPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>> {
}
