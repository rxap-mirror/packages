import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ThemeControllerGetRemoteMethod } from '../remote-methods/theme-controller-get.remote-method';
import { ThemeControllerGetResponse } from '../responses/theme-controller-get.response';

@Directive({
  selector: '[themeControllerGetRemoteMethod]',
  exportAs: 'themeControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerGetRemoteMethod } ],
})
export class ThemeControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ThemeControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'themeControllerGetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'themeControllerGetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'themeControllerGetRemoteMethodError' });
}

@Directive({
  selector: '[themeControllerGetRemoteMethod]',
  exportAs: 'themeControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerGetRemoteMethod } ],
})
export class ThemeControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<ThemeControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
}
