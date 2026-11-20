import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ThemeControllerSetRemoteMethod } from '../remote-methods/theme-controller-set.remote-method';
import { ThemeControllerSetRequestBody } from '../request-bodies/theme-controller-set.request-body';

@Directive({
  selector: '[themeControllerSetRemoteMethod]',
  exportAs: 'themeControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetRemoteMethod } ],
})
export class ThemeControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>>(undefined, { alias: 'themeControllerSetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'themeControllerSetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'themeControllerSetRemoteMethodError' });
}

@Directive({
  selector: '[themeControllerSetRemoteMethod]',
  exportAs: 'themeControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetRemoteMethod } ],
})
export class ThemeControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>> {
}
