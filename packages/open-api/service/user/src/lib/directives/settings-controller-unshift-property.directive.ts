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
import { SettingsControllerUnshiftPropertyParameter } from '../parameters/settings-controller-unshift-property.parameter';
import { SettingsControllerUnshiftPropertyRemoteMethod } from '../remote-methods/settings-controller-unshift-property.remote-method';
import { SettingsControllerUnshiftPropertyResponse } from '../responses/settings-controller-unshift-property.response';

@Directive({
  selector: '[settingsControllerUnshiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerUnshiftPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerUnshiftPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerUnshiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>> {
  @Input('settingsControllerUnshiftPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>;
  @Input('settingsControllerUnshiftPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerUnshiftPropertyRemoteMethod) remoteMethod: SettingsControllerUnshiftPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerUnshiftPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerUnshiftPropertyRemoteMethod]',
  exportAs: 'settingsControllerUnshiftPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerUnshiftPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerUnshiftPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerUnshiftPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerUnshiftPropertyRemoteMethod) remoteMethod: SettingsControllerUnshiftPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
