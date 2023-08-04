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
import { ConfigurationControllerGetLatestParameter } from '../parameters/configuration-controller-get-latest.parameter';
import { ConfigurationControllerGetLatestResponse } from '../responses/configuration-controller-get-latest.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('ConfigurationController_getLatest')
export class ConfigurationControllerGetLatestRemoteMethod
  extends OpenApiRemoteMethod<ConfigurationControllerGetLatestResponse, ConfigurationControllerGetLatestParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>): Promise<ConfigurationControllerGetLatestResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
})
export class ConfigurationControllerGetLatestRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ConfigurationControllerGetLatestResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>> {
  @Input('configurationControllerGetLatestRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>;
  @Input('configurationControllerGetLatestRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ConfigurationControllerGetLatestRemoteMethod) remoteMethod: ConfigurationControllerGetLatestRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ConfigurationControllerGetLatestResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ ConfigurationControllerGetLatestRemoteMethodTemplateDirective ],
  exports: [ ConfigurationControllerGetLatestRemoteMethodTemplateDirective ],
})
export class ConfigurationControllerGetLatestRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
})
export class ConfigurationControllerGetLatestRemoteMethodDirective
  extends RemoteMethodDirective<ConfigurationControllerGetLatestResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ConfigurationControllerGetLatestRemoteMethod) remoteMethod: ConfigurationControllerGetLatestRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@NgModule({
  declarations: [ ConfigurationControllerGetLatestRemoteMethodDirective ],
  exports: [ ConfigurationControllerGetLatestRemoteMethodDirective ],
})
export class ConfigurationControllerGetLatestRemoteMethodDirectiveModule {
}
