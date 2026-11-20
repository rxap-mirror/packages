import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerShiftPropertyParameter } from '../parameters/settings-controller-shift-property.parameter';
import { SettingsControllerShiftPropertyRemoteMethod } from '../remote-methods/settings-controller-shift-property.remote-method';
import { SettingsControllerShiftPropertyResponse } from '../responses/settings-controller-shift-property.response';

@Directive({
  selector: '[settingsControllerShiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerShiftPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerShiftPropertyRemoteMethod } ],
})
export class SettingsControllerShiftPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerShiftPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>>(undefined, { alias: 'settingsControllerShiftPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerShiftPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerShiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerShiftPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerShiftPropertyRemoteMethod } ],
})
export class SettingsControllerShiftPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerShiftPropertyResponse<TResponse>, OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>> {
}
