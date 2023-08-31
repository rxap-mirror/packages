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
import { AppControllerNameResponse } from '../responses/app-controller-name.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod({
  serverId: 'service-status',
  operationId: 'AppController_name',
  operation: '{"operationId":"AppController_name","parameters":[],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}},"method":"get","path":"/"}',
})
export class AppControllerNameRemoteMethod extends OpenApiRemoteMethod<AppControllerNameResponse, void, void> {
  public override call(): Promise<AppControllerNameResponse> {
    return super.call();
  }
}

@Directive({
  selector: '[appControllerNameRemoteMethod]',
  exportAs: 'appControllerNameRemoteMethod',
})
export class AppControllerNameRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<AppControllerNameResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('appControllerNameRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('appControllerNameRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerNameRemoteMethod) remoteMethod: AppControllerNameRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<AppControllerNameResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
  declarations: [ AppControllerNameRemoteMethodTemplateDirective ],
  exports: [ AppControllerNameRemoteMethodTemplateDirective ],
})
export class AppControllerNameRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[appControllerNameRemoteMethod]',
  exportAs: 'appControllerNameRemoteMethod',
})
export class AppControllerNameRemoteMethodDirective
  extends RemoteMethodDirective<AppControllerNameResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerNameRemoteMethod) remoteMethod: AppControllerNameRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ AppControllerNameRemoteMethodDirective ],
  exports: [ AppControllerNameRemoteMethodDirective ],
})
export class AppControllerNameRemoteMethodDirectiveModule {
}
