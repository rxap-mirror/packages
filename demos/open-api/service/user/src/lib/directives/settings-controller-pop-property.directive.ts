import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerPopPropertyParameter } from '../parameters/settings-controller-pop-property.parameter';
import { SettingsControllerPopPropertyRemoteMethod } from '../remote-methods/settings-controller-pop-property.remote-method';
import { SettingsControllerPopPropertyResponse } from '../responses/settings-controller-pop-property.response';

@Directive({
  selector: '[settingsControllerPopPropertyRemoteMethod]',
  exportAs: 'settingsControllerPopPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerPopPropertyRemoteMethod } ],
})
export class SettingsControllerPopPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerPopPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>>(undefined, { alias: 'settingsControllerPopPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerPopPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerPopPropertyRemoteMethod]',
  exportAs: 'settingsControllerPopPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerPopPropertyRemoteMethod } ],
})
export class SettingsControllerPopPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerPopPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>> {
}
