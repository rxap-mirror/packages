import {
  ChangeDetectorRef,
  Directive,
  INJECTOR,
  Inject,
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
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';
import { SettingsControllerGetPropertyRemoteMethod } from '../remote-methods/settings-controller-get-property.remote-method';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';

@Directive({
  selector: '[settingsControllerGetPropertyRemoteMethod]',
  exportAs: 'settingsControllerGetPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerGetPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerGetPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>> {
  @Input('settingsControllerGetPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>;
  @Input('settingsControllerGetPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerGetPropertyRemoteMethod) remoteMethod: SettingsControllerGetPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerGetPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerGetPropertyRemoteMethod]',
  exportAs: 'settingsControllerGetPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerGetPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerGetPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerGetPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerGetPropertyRemoteMethod) remoteMethod: SettingsControllerGetPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
