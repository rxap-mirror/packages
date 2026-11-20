import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { HealthControllerHealthCheckRemoteMethod } from '../remote-methods/health-controller-health-check.remote-method';
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: HealthControllerHealthCheckRemoteMethod } ],
})
export class HealthControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<void, void>>(undefined, { alias: 'healthControllerHealthCheckRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'healthControllerHealthCheckRemoteMethodError' });
  override readonly withoutParameters = input(true, { alias: 'healthControllerHealthCheckRemoteMethodWithoutParameters' });
}

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: HealthControllerHealthCheckRemoteMethod } ],
})
export class HealthControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
}
