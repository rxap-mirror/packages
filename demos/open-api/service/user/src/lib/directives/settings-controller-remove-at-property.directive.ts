import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';
import { SettingsControllerRemoveAtPropertyRemoteMethod } from '../remote-methods/settings-controller-remove-at-property.remote-method';

@Directive({
  selector: '[settingsControllerRemoveAtPropertyRemoteMethod]',
  exportAs: 'settingsControllerRemoveAtPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerRemoveAtPropertyRemoteMethod } ],
})
export class SettingsControllerRemoveAtPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>>(undefined, { alias: 'settingsControllerRemoveAtPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerRemoveAtPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerRemoveAtPropertyRemoteMethod]',
  exportAs: 'settingsControllerRemoveAtPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerRemoveAtPropertyRemoteMethod } ],
})
export class SettingsControllerRemoveAtPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>> {
}
