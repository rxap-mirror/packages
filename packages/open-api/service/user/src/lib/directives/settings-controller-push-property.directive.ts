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
import { SettingsControllerPushPropertyParameter } from '../parameters/settings-controller-push-property.parameter';
import { SettingsControllerPushPropertyRemoteMethod } from '../remote-methods/settings-controller-push-property.remote-method';
import { SettingsControllerPushPropertyResponse } from '../responses/settings-controller-push-property.response';

@Directive({
  selector: '[settingsControllerPushPropertyRemoteMethod]',
  exportAs: 'settingsControllerPushPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerPushPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerPushPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>> {
  @Input('settingsControllerPushPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>;
  @Input('settingsControllerPushPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerPushPropertyRemoteMethod) remoteMethod: SettingsControllerPushPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerPushPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerPushPropertyRemoteMethod]',
  exportAs: 'settingsControllerPushPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerPushPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerPushPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerPushPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerPushPropertyRemoteMethod) remoteMethod: SettingsControllerPushPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
