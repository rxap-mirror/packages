import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { DarkModeControllerToggleRemoteMethod } from '../remote-methods/dark-mode-controller-toggle.remote-method';
import { DarkModeControllerToggleResponse } from '../responses/dark-mode-controller-toggle.response';

@Directive({
  selector: '[darkModeControllerToggleRemoteMethod]',
  exportAs: 'darkModeControllerToggleRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerToggleRemoteMethod } ],
})
export class DarkModeControllerToggleRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerToggleResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'darkModeControllerToggleRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'darkModeControllerToggleRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'darkModeControllerToggleRemoteMethodError' });
}

@Directive({
  selector: '[darkModeControllerToggleRemoteMethod]',
  exportAs: 'darkModeControllerToggleRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: DarkModeControllerToggleRemoteMethod } ],
})
export class DarkModeControllerToggleRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerToggleResponse, OpenApiRemoteMethodParameter<void, void>> {
}
