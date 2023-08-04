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
import { StatusControllerHealthCheckResponse } from '../responses/status-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('StatusController_healthCheck')
export class StatusControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<StatusControllerHealthCheckResponse, void, void> {
  public override call(): Promise<StatusControllerHealthCheckResponse> {
    return super.call();
  }
}

@Directive({
  selector: '[statusControllerHealthCheckRemoteMethod]',
  exportAs: 'statusControllerHealthCheckRemoteMethod',
})
export class StatusControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('statusControllerHealthCheckRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('statusControllerHealthCheckRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

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
    this.withoutParameters = true;
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
  extends RemoteMethodDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
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
