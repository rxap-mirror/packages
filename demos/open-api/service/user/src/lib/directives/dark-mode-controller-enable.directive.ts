import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DarkModeControllerEnableRemoteMethod } from '../remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerEnableResponse } from '../responses/dark-mode-controller-enable.response';

@Directive({
  selector: '[darkModeControllerEnableRemoteMethod]',
  exportAs: 'darkModeControllerEnableRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerEnableRemoteMethod } ],
})
export class DarkModeControllerEnableRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerEnableResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'darkModeControllerEnableRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'darkModeControllerEnableRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'darkModeControllerEnableRemoteMethodError' });
}

@Directive({
  selector: '[darkModeControllerEnableRemoteMethod]',
  exportAs: 'darkModeControllerEnableRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerEnableRemoteMethod } ],
})
export class DarkModeControllerEnableRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerEnableResponse, OpenApiRemoteMethodParameter<void, void>> {
}
