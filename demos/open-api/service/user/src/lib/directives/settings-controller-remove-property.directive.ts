import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';
import { SettingsControllerRemovePropertyRemoteMethod } from '../remote-methods/settings-controller-remove-property.remote-method';

@Directive({
  selector: '[settingsControllerRemovePropertyRemoteMethod]',
  exportAs: 'settingsControllerRemovePropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerRemovePropertyRemoteMethod } ],
})
export class SettingsControllerRemovePropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>>(undefined, { alias: 'settingsControllerRemovePropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerRemovePropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerRemovePropertyRemoteMethod]',
  exportAs: 'settingsControllerRemovePropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerRemovePropertyRemoteMethod } ],
})
export class SettingsControllerRemovePropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>> {
}
