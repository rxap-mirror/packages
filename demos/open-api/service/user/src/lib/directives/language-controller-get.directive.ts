import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { LanguageControllerGetRemoteMethod } from '../remote-methods/language-controller-get.remote-method';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Directive({
  selector: '[languageControllerGetRemoteMethod]',
  exportAs: 'languageControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: LanguageControllerGetRemoteMethod } ],
})
export class LanguageControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<LanguageControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'languageControllerGetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'languageControllerGetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'languageControllerGetRemoteMethodError' });
}

@Directive({
  selector: '[languageControllerGetRemoteMethod]',
  exportAs: 'languageControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: LanguageControllerGetRemoteMethod } ],
})
export class LanguageControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<LanguageControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
}
