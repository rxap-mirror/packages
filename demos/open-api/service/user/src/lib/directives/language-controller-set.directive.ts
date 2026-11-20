import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { LanguageControllerSetParameter } from '../parameters/language-controller-set.parameter';
import { LanguageControllerSetRemoteMethod } from '../remote-methods/language-controller-set.remote-method';

@Directive({
  selector: '[languageControllerSetRemoteMethod]',
  exportAs: 'languageControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: LanguageControllerSetRemoteMethod } ],
})
export class LanguageControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>>(undefined, { alias: 'languageControllerSetRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'languageControllerSetRemoteMethodError' });
}

@Directive({
  selector: '[languageControllerSetRemoteMethod]',
  exportAs: 'languageControllerSetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: LanguageControllerSetRemoteMethod } ],
})
export class LanguageControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>> {
}
