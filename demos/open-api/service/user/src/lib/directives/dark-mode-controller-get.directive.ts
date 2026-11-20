import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DarkModeControllerGetRemoteMethod } from '../remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';

@Directive({
  selector: '[darkModeControllerGetRemoteMethod]',
  exportAs: 'darkModeControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerGetRemoteMethod } ],
})
export class DarkModeControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'darkModeControllerGetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'darkModeControllerGetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'darkModeControllerGetRemoteMethodError' });
}

@Directive({
  selector: '[darkModeControllerGetRemoteMethod]',
  exportAs: 'darkModeControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerGetRemoteMethod } ],
})
export class DarkModeControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
}
