import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ThemeControllerSetTypographyRemoteMethod } from '../remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetTypographyRequestBody } from '../request-bodies/theme-controller-set-typography.request-body';

@Directive({
  selector: '[themeControllerSetTypographyRemoteMethod]',
  exportAs: 'themeControllerSetTypographyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetTypographyRemoteMethod } ],
})
export class ThemeControllerSetTypographyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>>(undefined, { alias: 'themeControllerSetTypographyRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'themeControllerSetTypographyRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'themeControllerSetTypographyRemoteMethodError' });
}

@Directive({
  selector: '[themeControllerSetTypographyRemoteMethod]',
  exportAs: 'themeControllerSetTypographyRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetTypographyRemoteMethod } ],
})
export class ThemeControllerSetTypographyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>> {
}
