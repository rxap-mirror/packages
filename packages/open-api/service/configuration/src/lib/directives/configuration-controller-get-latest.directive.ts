import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ConfigurationControllerGetLatestParameter } from '../parameters/configuration-controller-get-latest.parameter';
import { ConfigurationControllerGetLatestRemoteMethod } from '../remote-methods/configuration-controller-get-latest.remote-method';
import { ConfigurationControllerGetLatestResponse } from '../responses/configuration-controller-get-latest.response';

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
  standalone: true,
})
export class ConfigurationControllerGetLatestRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ConfigurationControllerGetLatestResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>> {
  @Input('configurationControllerGetLatestRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<ConfigurationControllerGetLatestParameter, void>;
  @Input('configurationControllerGetLatestRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

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

@Directive({
  selector: '[configurationControllerGetLatestRemoteMethod]',
  exportAs: 'configurationControllerGetLatestRemoteMethod',
  standalone: true,
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
