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
import { SettingsControllerDecrementPropertyParameter } from '../parameters/settings-controller-decrement-property.parameter';
import { SettingsControllerDecrementPropertyRemoteMethod } from '../remote-methods/settings-controller-decrement-property.remote-method';
import { SettingsControllerDecrementPropertyResponse } from '../responses/settings-controller-decrement-property.response';

@Directive({
  selector: '[settingsControllerDecrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerDecrementPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerDecrementPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerDecrementPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>> {
  @Input('settingsControllerDecrementPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>;
  @Input('settingsControllerDecrementPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerDecrementPropertyRemoteMethod) remoteMethod: SettingsControllerDecrementPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerDecrementPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerDecrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerDecrementPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerDecrementPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerDecrementPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerDecrementPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerDecrementPropertyRemoteMethod) remoteMethod: SettingsControllerDecrementPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
