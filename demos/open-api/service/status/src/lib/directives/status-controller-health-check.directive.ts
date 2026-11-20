import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerHealthCheckParameter } from '../parameters/status-controller-health-check.parameter';
import { StatusControllerHealthCheckRemoteMethod } from '../remote-methods/status-controller-health-check.remote-method';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Directive({
  selector: '[statusControllerHealthCheckRemoteMethod]',
  exportAs: 'statusControllerHealthCheckRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: StatusControllerHealthCheckRemoteMethod } ],
})
export class StatusControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>>(undefined, { alias: 'statusControllerHealthCheckRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'statusControllerHealthCheckRemoteMethodError' });
}

@Directive({
  selector: '[statusControllerHealthCheckRemoteMethod]',
  exportAs: 'statusControllerHealthCheckRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: StatusControllerHealthCheckRemoteMethod } ],
})
export class StatusControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
}
