import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DarkModeControllerDisableRemoteMethod } from '../remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerDisableResponse } from '../responses/dark-mode-controller-disable.response';

@Directive({
  selector: '[darkModeControllerDisableRemoteMethod]',
  exportAs: 'darkModeControllerDisableRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerDisableRemoteMethod } ],
})
export class DarkModeControllerDisableRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerDisableResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'darkModeControllerDisableRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'darkModeControllerDisableRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'darkModeControllerDisableRemoteMethodError' });
}

@Directive({
  selector: '[darkModeControllerDisableRemoteMethod]',
  exportAs: 'darkModeControllerDisableRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerDisableRemoteMethod } ],
})
export class DarkModeControllerDisableRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerDisableResponse, OpenApiRemoteMethodParameter<void, void>> {
}
