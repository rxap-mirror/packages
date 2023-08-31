import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerHealthCheckParameter } from '../parameters/status-controller-health-check.parameter';
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'StatusController_healthCheck',
  operation: '{"operationId":"StatusController_healthCheck","parameters":[{"name":"service","required":true,"in":"query","schema":{"type":"array","items":{"type":"string"}}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}}},"method":"get","path":"/many"}',
})
export class StatusControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerHealthCheckResponse, StatusControllerHealthCheckParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>): Promise<StatusControllerHealthCheckResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[statusControllerHealthCheckRemoteMethod]',
  exportAs: 'statusControllerHealthCheckRemoteMethod',
})
export class StatusControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
  @Input('statusControllerHealthCheckRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>;
  @Input('statusControllerHealthCheckRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckRemoteMethod) remoteMethod: StatusControllerHealthCheckRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerHealthCheckResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ StatusControllerHealthCheckRemoteMethodTemplateDirective ],
  exports: [ StatusControllerHealthCheckRemoteMethodTemplateDirective ],
})
export class StatusControllerHealthCheckRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[statusControllerHealthCheckRemoteMethod]',
  exportAs: 'statusControllerHealthCheckRemoteMethod',
})
export class StatusControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckRemoteMethod) remoteMethod: StatusControllerHealthCheckRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ StatusControllerHealthCheckRemoteMethodDirective ],
  exports: [ StatusControllerHealthCheckRemoteMethodDirective ],
})
export class StatusControllerHealthCheckRemoteMethodDirectiveModule {
}
