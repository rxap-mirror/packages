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
import { AppControllerEnvironmentResponse } from '../responses/app-controller-environment.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('AppController_environment')
export class AppControllerEnvironmentRemoteMethod
  extends OpenApiRemoteMethod<AppControllerEnvironmentResponse, void, void> {
  public override call(): Promise<AppControllerEnvironmentResponse> {
    return super.call();
  }
}

@Directive({
  selector: '[appControllerEnvironmentRemoteMethod]',
  exportAs: 'appControllerEnvironmentRemoteMethod',
})
export class AppControllerEnvironmentRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('appControllerEnvironmentRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('appControllerEnvironmentRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerEnvironmentRemoteMethod) remoteMethod: AppControllerEnvironmentRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<AppControllerEnvironmentResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
  declarations: [ AppControllerEnvironmentRemoteMethodTemplateDirective ],
  exports: [ AppControllerEnvironmentRemoteMethodTemplateDirective ],
})
export class AppControllerEnvironmentRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[appControllerEnvironmentRemoteMethod]',
  exportAs: 'appControllerEnvironmentRemoteMethod',
})
export class AppControllerEnvironmentRemoteMethodDirective
  extends RemoteMethodDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerEnvironmentRemoteMethod) remoteMethod: AppControllerEnvironmentRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ AppControllerEnvironmentRemoteMethodDirective ],
  exports: [ AppControllerEnvironmentRemoteMethodDirective ],
})
export class AppControllerEnvironmentRemoteMethodDirectiveModule {
}
