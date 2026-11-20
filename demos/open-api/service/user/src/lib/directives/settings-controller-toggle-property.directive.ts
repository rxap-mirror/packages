import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';
import { SettingsControllerTogglePropertyRemoteMethod } from '../remote-methods/settings-controller-toggle-property.remote-method';

@Directive({
  selector: '[settingsControllerTogglePropertyRemoteMethod]',
  exportAs: 'settingsControllerTogglePropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerTogglePropertyRemoteMethod } ],
})
export class SettingsControllerTogglePropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>>(undefined, { alias: 'settingsControllerTogglePropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerTogglePropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerTogglePropertyRemoteMethod]',
  exportAs: 'settingsControllerTogglePropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerTogglePropertyRemoteMethod } ],
})
export class SettingsControllerTogglePropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>> {
}
