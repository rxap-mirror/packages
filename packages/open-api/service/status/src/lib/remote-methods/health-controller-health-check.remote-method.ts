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
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('HealthController_healthCheck')
export class HealthControllerHealthCheckRemoteMethod
  extends OpenApiRemoteMethod<HealthControllerHealthCheckResponse, void, void> {
  public override call(): Promise<HealthControllerHealthCheckResponse> {
    return super.call();
  }
}

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
})
export class HealthControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('healthControllerHealthCheckRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('healthControllerHealthCheckRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(HealthControllerHealthCheckRemoteMethod) remoteMethod: HealthControllerHealthCheckRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<HealthControllerHealthCheckResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
  declarations: [ HealthControllerHealthCheckRemoteMethodTemplateDirective ],
  exports: [ HealthControllerHealthCheckRemoteMethodTemplateDirective ],
})
export class HealthControllerHealthCheckRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
})
export class HealthControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(HealthControllerHealthCheckRemoteMethod) remoteMethod: HealthControllerHealthCheckRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ HealthControllerHealthCheckRemoteMethodDirective ],
  exports: [ HealthControllerHealthCheckRemoteMethodDirective ],
})
export class HealthControllerHealthCheckRemoteMethodDirectiveModule {
}
