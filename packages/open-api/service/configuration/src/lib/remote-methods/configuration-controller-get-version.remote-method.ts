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
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('ConfigurationController_getVersion')
export class ConfigurationControllerGetVersionRemoteMethod
  extends OpenApiRemoteMethod<ConfigurationControllerGetVersionResponse, ConfigurationControllerGetVersionParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>): Promise<ConfigurationControllerGetVersionResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
})
export class ConfigurationControllerGetVersionRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ConfigurationControllerGetVersionResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>> {
  @Input('configurationControllerGetVersionRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>;
  @Input('configurationControllerGetVersionRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ConfigurationControllerGetVersionRemoteMethod) remoteMethod: ConfigurationControllerGetVersionRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ConfigurationControllerGetVersionResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ ConfigurationControllerGetVersionRemoteMethodTemplateDirective ],
  exports: [ ConfigurationControllerGetVersionRemoteMethodTemplateDirective ],
})
export class ConfigurationControllerGetVersionRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
})
export class ConfigurationControllerGetVersionRemoteMethodDirective
  extends RemoteMethodDirective<ConfigurationControllerGetVersionResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ConfigurationControllerGetVersionRemoteMethod) remoteMethod: ConfigurationControllerGetVersionRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ ConfigurationControllerGetVersionRemoteMethodDirective ],
  exports: [ ConfigurationControllerGetVersionRemoteMethodDirective ],
})
export class ConfigurationControllerGetVersionRemoteMethodDirectiveModule {
}
