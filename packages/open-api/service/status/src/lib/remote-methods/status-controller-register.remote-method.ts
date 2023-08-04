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

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('StatusController_register')
export class StatusControllerRegisterRemoteMethod
  extends OpenApiRemoteMethod<void, void, StatusControllerRegisterRequestBody> {
  public override call(parameters: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>): Promise<void> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[statusControllerRegisterRemoteMethod]',
  exportAs: 'statusControllerRegisterRemoteMethod',
})
export class StatusControllerRegisterRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
  @Input('statusControllerRegisterRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>;
  @Input('statusControllerRegisterRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerRegisterRemoteMethod) remoteMethod: StatusControllerRegisterRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
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
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
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
