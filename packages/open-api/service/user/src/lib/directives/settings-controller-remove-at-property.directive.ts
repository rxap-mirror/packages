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
import { SettingsControllerRemoveAtPropertyParameter } from '../parameters/settings-controller-remove-at-property.parameter';
import { SettingsControllerRemoveAtPropertyRemoteMethod } from '../remote-methods/settings-controller-remove-at-property.remote-method';
import { SettingsControllerRemoveAtPropertyResponse } from '../responses/settings-controller-remove-at-property.response';

@Directive({
  selector: '[settingsControllerRemoveAtPropertyRemoteMethod]',
  exportAs: 'settingsControllerRemoveAtPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerRemoveAtPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerRemoveAtPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>> {
  @Input('settingsControllerRemoveAtPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>;
  @Input('settingsControllerRemoveAtPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerRemoveAtPropertyRemoteMethod) remoteMethod: SettingsControllerRemoveAtPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerRemoveAtPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerRemoveAtPropertyRemoteMethod]',
  exportAs: 'settingsControllerRemoveAtPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerRemoveAtPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerRemoveAtPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerRemoveAtPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerRemoveAtPropertyRemoteMethod) remoteMethod: SettingsControllerRemoveAtPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
