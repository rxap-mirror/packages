import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ProfileControllerGetRemoteMethod } from '../remote-methods/profile-controller-get.remote-method';
import { ProfileControllerGetResponse } from '../responses/profile-controller-get.response';

@Directive({
  selector: '[profileControllerGetRemoteMethod]',
  exportAs: 'profileControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ProfileControllerGetRemoteMethod } ],
})
export class ProfileControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ProfileControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'profileControllerGetRemoteMethodParameters' });
  override readonly withoutParameters = input(true, { alias: 'profileControllerGetRemoteMethodWithoutParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'profileControllerGetRemoteMethodError' });
}

@Directive({
  selector: '[profileControllerGetRemoteMethod]',
  exportAs: 'profileControllerGetRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ProfileControllerGetRemoteMethod } ],
})
export class ProfileControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<ProfileControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
}
