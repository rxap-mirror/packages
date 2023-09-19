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
import { SettingsControllerSetPropertyParameter } from '../parameters/settings-controller-set-property.parameter';
import { SettingsControllerSetPropertyRemoteMethod } from '../remote-methods/settings-controller-set-property.remote-method';
import { SettingsControllerSetPropertyResponse } from '../responses/settings-controller-set-property.response';

@Directive({
  selector: '[settingsControllerSetPropertyRemoteMethod]',
  exportAs: 'settingsControllerSetPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerSetPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerSetPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>> {
  @Input('settingsControllerSetPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>;
  @Input('settingsControllerSetPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetPropertyRemoteMethod) remoteMethod: SettingsControllerSetPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerSetPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerSetPropertyRemoteMethod]',
  exportAs: 'settingsControllerSetPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerSetPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerSetPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerSetPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetPropertyRemoteMethod) remoteMethod: SettingsControllerSetPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
