import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { AppControllerNameRemoteMethod } from '../remote-methods/app-controller-name.remote-method';
import { AppControllerNameResponse } from '../responses/app-controller-name.response';

@Directive({
  selector: '[appControllerNameRemoteMethod]',
  exportAs: 'appControllerNameRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: AppControllerNameRemoteMethod } ],
})
export class AppControllerNameRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<AppControllerNameResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'appControllerNameRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'appControllerNameRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'appControllerNameRemoteMethodError' });
}

@Directive({
  selector: '[appControllerNameRemoteMethod]',
  exportAs: 'appControllerNameRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: AppControllerNameRemoteMethod } ],
})
export class AppControllerNameRemoteMethodDirective
  extends RemoteMethodDirective<AppControllerNameResponse, OpenApiRemoteMethodParameter<void, void>> {
}
