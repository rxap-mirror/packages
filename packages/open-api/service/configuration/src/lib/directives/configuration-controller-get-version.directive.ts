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
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionRemoteMethod } from '../remote-methods/configuration-controller-get-version.remote-method';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
  standalone: true,
})
export class ConfigurationControllerGetVersionRemoteMethodTemplateDirective
    extends RemoteMethodTemplateDirective<ConfigurationControllerGetVersionResponse, OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>> {
  @Input('configurationControllerGetVersionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<ConfigurationControllerGetVersionParameter, void>;
  @Input('configurationControllerGetVersionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

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

@Directive({
  selector: '[configurationControllerGetVersionRemoteMethod]',
  exportAs: 'configurationControllerGetVersionRemoteMethod',
  standalone: true,
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
