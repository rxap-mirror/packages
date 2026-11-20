import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';
import { SettingsControllerPushPropertyRemoteMethod } from '../remote-methods/settings-controller-push-property.remote-method';

@Directive({
  selector: '[settingsControllerPushPropertyRemoteMethod]',
  exportAs: 'settingsControllerPushPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerPushPropertyRemoteMethod } ],
})
export class SettingsControllerPushPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>>(undefined, { alias: 'settingsControllerPushPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerPushPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerPushPropertyRemoteMethod]',
  exportAs: 'settingsControllerPushPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerPushPropertyRemoteMethod } ],
})
export class SettingsControllerPushPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>> {
}
