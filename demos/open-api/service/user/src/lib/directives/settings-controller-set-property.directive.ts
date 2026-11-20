import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';
import { SettingsControllerSetPropertyRemoteMethod } from '../remote-methods/settings-controller-set-property.remote-method';

@Directive({
  selector: '[settingsControllerSetPropertyRemoteMethod]',
  exportAs: 'settingsControllerSetPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerSetPropertyRemoteMethod } ],
})
export class SettingsControllerSetPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>>(undefined, { alias: 'settingsControllerSetPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerSetPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerSetPropertyRemoteMethod]',
  exportAs: 'settingsControllerSetPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerSetPropertyRemoteMethod } ],
})
export class SettingsControllerSetPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>> {
}
