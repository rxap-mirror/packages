import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerIncrementPropertyParameter } from '../parameters/settings-controller-increment-property.parameter';
import { SettingsControllerIncrementPropertyRemoteMethod } from '../remote-methods/settings-controller-increment-property.remote-method';

@Directive({
  selector: '[settingsControllerIncrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerIncrementPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerIncrementPropertyRemoteMethod } ],
})
export class SettingsControllerIncrementPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>>(undefined, { alias: 'settingsControllerIncrementPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerIncrementPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerIncrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerIncrementPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerIncrementPropertyRemoteMethod } ],
})
export class SettingsControllerIncrementPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>> {
}
