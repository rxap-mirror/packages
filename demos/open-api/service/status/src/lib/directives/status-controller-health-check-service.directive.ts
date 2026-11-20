import { Directive, input, TemplateRef } from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN,
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerHealthCheckServiceParameter } from '../parameters/status-controller-health-check-service.parameter';
import { StatusControllerHealthCheckServiceRemoteMethod } from '../remote-methods/status-controller-health-check-service.remote-method';
import { StatusControllerHealthCheckServiceResponse } from '../responses/status-controller-health-check-service.response';

@Directive({
  selector: '[statusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'statusControllerHealthCheckServiceRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: StatusControllerHealthCheckServiceRemoteMethod } ],
})
export class StatusControllerHealthCheckServiceRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
  override readonly parameters = input<OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>>(undefined, { alias: 'statusControllerHealthCheckServiceRemoteMethodParameters' });
  override readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: 'statusControllerHealthCheckServiceRemoteMethodError' });
}

@Directive({
  selector: '[statusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'statusControllerHealthCheckServiceRemoteMethod',
  providers: [ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: StatusControllerHealthCheckServiceRemoteMethod } ],
})
export class StatusControllerHealthCheckServiceRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
}
