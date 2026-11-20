import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageRemoteMethod } from '../remote-methods/minimum-table-controller-get-page.remote-method';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: MinimumTableControllerGetPageRemoteMethod } ],
})
export class MinimumTableControllerGetPageRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<MinimumTableControllerGetPageResponse, OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>>(undefined, { alias: 'minimumTableControllerGetPageRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'minimumTableControllerGetPageRemoteMethodError' });
}

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: MinimumTableControllerGetPageRemoteMethod } ],
})
export class MinimumTableControllerGetPageRemoteMethodDirective
  extends RemoteMethodDirective<MinimumTableControllerGetPageResponse, OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>> {
}
