import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerDecrementPropertyParameter } from '../parameters/settings-controller-decrement-property.parameter';
import { SettingsControllerDecrementPropertyRemoteMethod } from '../remote-methods/settings-controller-decrement-property.remote-method';

@Directive({
  selector: '[settingsControllerDecrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerDecrementPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerDecrementPropertyRemoteMethod } ],
})
export class SettingsControllerDecrementPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>>(undefined, { alias: 'settingsControllerDecrementPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerDecrementPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerDecrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerDecrementPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerDecrementPropertyRemoteMethod } ],
})
export class SettingsControllerDecrementPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>> {
}
