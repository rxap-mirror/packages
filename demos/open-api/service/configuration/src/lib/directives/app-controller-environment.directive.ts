import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { AppControllerEnvironmentRemoteMethod } from '../remote-methods/app-controller-environment.remote-method';
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Directive({
  selector: '[appControllerEnvironmentRemoteMethod]',
  exportAs: 'appControllerEnvironmentRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: AppControllerEnvironmentRemoteMethod } ],
})
export class AppControllerEnvironmentRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'appControllerEnvironmentRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'appControllerEnvironmentRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'appControllerEnvironmentRemoteMethodError' });
}

@Directive({
  selector: '[appControllerEnvironmentRemoteMethod]',
  exportAs: 'appControllerEnvironmentRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: AppControllerEnvironmentRemoteMethod } ],
})
export class AppControllerEnvironmentRemoteMethodDirective
  extends RemoteMethodDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
}
