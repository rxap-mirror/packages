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
import { SettingsControllerRemovePropertyParameter } from '../parameters/settings-controller-remove-property.parameter';
import { SettingsControllerRemovePropertyRemoteMethod } from '../remote-methods/settings-controller-remove-property.remote-method';
import { SettingsControllerRemovePropertyResponse } from '../responses/settings-controller-remove-property.response';

@Directive({
  selector: '[settingsControllerRemovePropertyRemoteMethod]',
  exportAs: 'settingsControllerRemovePropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerRemovePropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerRemovePropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>> {
  @Input('settingsControllerRemovePropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>;
  @Input('settingsControllerRemovePropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerRemovePropertyRemoteMethod) remoteMethod: SettingsControllerRemovePropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerRemovePropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerRemovePropertyRemoteMethod]',
  exportAs: 'settingsControllerRemovePropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerRemovePropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerRemovePropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerRemovePropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerRemovePropertyRemoteMethod) remoteMethod: SettingsControllerRemovePropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
