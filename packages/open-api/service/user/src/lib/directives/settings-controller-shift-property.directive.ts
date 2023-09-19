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
import { SettingsControllerShiftPropertyParameter } from '../parameters/settings-controller-shift-property.parameter';
import { SettingsControllerShiftPropertyRemoteMethod } from '../remote-methods/settings-controller-shift-property.remote-method';
import { SettingsControllerShiftPropertyResponse } from '../responses/settings-controller-shift-property.response';

@Directive({
  selector: '[settingsControllerShiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerShiftPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerShiftPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerShiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>> {
  @Input('settingsControllerShiftPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>;
  @Input('settingsControllerShiftPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerShiftPropertyRemoteMethod) remoteMethod: SettingsControllerShiftPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerShiftPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerShiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerShiftPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerShiftPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerShiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerShiftPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerShiftPropertyRemoteMethod) remoteMethod: SettingsControllerShiftPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
