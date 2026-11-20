import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionRemoteMethod } from '../remote-methods/configuration-controller-get-version.remote-method';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ConfigurationControllerGetVersionRemoteMethod } ],
})
export class ConfigurationControllerGetVersionRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ConfigurationControllerGetVersionResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>>(undefined, { alias: 'configurationControllerGetVersionRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'configurationControllerGetVersionRemoteMethodError' });
}

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ConfigurationControllerGetVersionRemoteMethod } ],
})
export class ConfigurationControllerGetVersionRemoteMethodDirective
  extends RemoteMethodDirective<ConfigurationControllerGetVersionResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>> {
}
