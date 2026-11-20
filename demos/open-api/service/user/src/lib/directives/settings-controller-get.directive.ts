import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { SettingsControllerGetRemoteMethod } from '../remote-methods/settings-controller-get.remote-method';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Directive({
  selector: '[settingsControllerGetRemoteMethod]',
  exportAs: 'settingsControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerGetRemoteMethod } ],
})
export class SettingsControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'settingsControllerGetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'settingsControllerGetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'settingsControllerGetRemoteMethodError' });
}

@Directive({
  selector: '[settingsControllerGetRemoteMethod]',
  exportAs: 'settingsControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: SettingsControllerGetRemoteMethod } ],
})
export class SettingsControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
}
