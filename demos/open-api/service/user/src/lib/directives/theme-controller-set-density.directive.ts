import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ThemeControllerSetDensityRemoteMethod } from '../remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetDensityRequestBody } from '../request-bodies/theme-controller-set-density.request-body';

@Directive({
  selector: '[themeControllerSetDensityRemoteMethod]',
  exportAs: 'themeControllerSetDensityRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetDensityRemoteMethod } ],
})
export class ThemeControllerSetDensityRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>>(undefined, { alias: 'themeControllerSetDensityRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'themeControllerSetDensityRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'themeControllerSetDensityRemoteMethodError' });
}

@Directive({
  selector: '[themeControllerSetDensityRemoteMethod]',
  exportAs: 'themeControllerSetDensityRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetDensityRemoteMethod } ],
})
export class ThemeControllerSetDensityRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>> {
}
