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
import { StatusControllerRegisterRequestBody } from '../request-bodies/status-controller-register.request-body';
import { StatusControllerRegisterResponse } from '../responses/status-controller-register.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'StatusController_register',
  operation: '{"operationId":"StatusController_register","parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"url":{"type":"string"},"port":{"type":"number"}},"required":["name"]}}}},"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"status":{"type":"string"},"info":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"error":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}},"nullable":true},"details":{"type":"object","additionalProperties":{"type":"object","properties":{"status":{"type":"string"}},"additionalProperties":{"type":"string"}}}}}}}},"201":{"content":{"application/json":{"schema":{"type":"object"}}}}},"method":"post","path":"/register"}',
})
export class StatusControllerRegisterRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerRegisterResponse, void, StatusControllerRegisterRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>): Promise<StatusControllerRegisterResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[statusControllerRegisterRemoteMethod]',
  exportAs: 'statusControllerRegisterRemoteMethod',
})
export class StatusControllerRegisterRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerRegisterResponse, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
  @Input('statusControllerRegisterRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>;
  @Input('statusControllerRegisterRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerRegisterRemoteMethod) remoteMethod: StatusControllerRegisterRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerRegisterResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
  declarations: [ StatusControllerRegisterRemoteMethodTemplateDirective ],
  exports: [ StatusControllerRegisterRemoteMethodTemplateDirective ],
})
export class StatusControllerRegisterRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[statusControllerRegisterRemoteMethod]',
  exportAs: 'statusControllerRegisterRemoteMethod',
})
export class StatusControllerRegisterRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerRegisterResponse, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerRegisterRemoteMethod) remoteMethod: StatusControllerRegisterRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ StatusControllerRegisterRemoteMethodDirective ],
  exports: [ StatusControllerRegisterRemoteMethodDirective ],
})
export class StatusControllerRegisterRemoteMethodDirectiveModule {
}
