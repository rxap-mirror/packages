import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ConfigurationControllerGetLatestParameter } from '../parameters/configuration-controller-get-latest.parameter';
import { ConfigurationControllerGetLatestRemoteMethod } from '../remote-methods/configuration-controller-get-latest.remote-method';
import { ConfigurationControllerGetLatestResponse } from '../responses/configuration-controller-get-latest.response';

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ConfigurationControllerGetLatestRemoteMethod } ],
})
export class ConfigurationControllerGetLatestRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ConfigurationControllerGetLatestResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>>(undefined, { alias: 'configurationControllerGetLatestRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'configurationControllerGetLatestRemoteMethodError' });
}

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ConfigurationControllerGetLatestRemoteMethod } ],
})
export class ConfigurationControllerGetLatestRemoteMethodDirective
  extends RemoteMethodDirective<ConfigurationControllerGetLatestResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>> {
}
