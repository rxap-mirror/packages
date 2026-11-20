import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerUnshiftPropertyParameter } from '../parameters/settings-controller-unshift-property.parameter';
import { SettingsControllerUnshiftPropertyRemoteMethod } from '../remote-methods/settings-controller-unshift-property.remote-method';
import { SettingsControllerUnshiftPropertyResponse } from '../responses/settings-controller-unshift-property.response';

@Directive({
  selector: '[settingsControllerUnshiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerUnshiftPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerUnshiftPropertyRemoteMethod } ],
})
export class SettingsControllerUnshiftPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerUnshiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>>(undefined, { alias: 'settingsControllerUnshiftPropertyRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerUnshiftPropertyRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerUnshiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerUnshiftPropertyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerUnshiftPropertyRemoteMethod } ],
})
export class SettingsControllerUnshiftPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerUnshiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>> {
}
