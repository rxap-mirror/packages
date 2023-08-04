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
import { StatusControllerHealthCheckServiceParameter } from '../parameters/status-controller-health-check-service.parameter';
import { StatusControllerHealthCheckServiceResponse } from '../responses/status-controller-health-check-service.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('StatusController_healthCheckService')
export class StatusControllerHealthCheckServiceRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerHealthCheckServiceResponse, StatusControllerHealthCheckServiceParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>): Promise<StatusControllerHealthCheckServiceResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[statusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'statusControllerHealthCheckServiceRemoteMethod',
})
export class StatusControllerHealthCheckServiceRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
  @Input('statusControllerHealthCheckServiceRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>;
  @Input('statusControllerHealthCheckServiceRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckServiceRemoteMethod) remoteMethod: StatusControllerHealthCheckServiceRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerHealthCheckServiceResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ StatusControllerHealthCheckServiceRemoteMethodTemplateDirective ],
  exports: [ StatusControllerHealthCheckServiceRemoteMethodTemplateDirective ],
})
export class StatusControllerHealthCheckServiceRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[statusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'statusControllerHealthCheckServiceRemoteMethod',
})
export class StatusControllerHealthCheckServiceRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckServiceRemoteMethod) remoteMethod: StatusControllerHealthCheckServiceRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ StatusControllerHealthCheckServiceRemoteMethodDirective ],
  exports: [ StatusControllerHealthCheckServiceRemoteMethodDirective ],
})
export class StatusControllerHealthCheckServiceRemoteMethodDirectiveModule {
}
