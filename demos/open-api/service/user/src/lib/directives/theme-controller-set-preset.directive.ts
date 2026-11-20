import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ThemeControllerSetPresetRemoteMethod } from '../remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetPresetRequestBody } from '../request-bodies/theme-controller-set-preset.request-body';

@Directive({
  selector: '[themeControllerSetPresetRemoteMethod]',
  exportAs: 'themeControllerSetPresetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetPresetRemoteMethod } ],
})
export class ThemeControllerSetPresetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>>(undefined, { alias: 'themeControllerSetPresetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'themeControllerSetPresetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'themeControllerSetPresetRemoteMethodError' });
}

@Directive({
  selector: '[themeControllerSetPresetRemoteMethod]',
  exportAs: 'themeControllerSetPresetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ThemeControllerSetPresetRemoteMethod } ],
})
export class ThemeControllerSetPresetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>> {
}
