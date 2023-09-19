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
import { SettingsControllerPopPropertyParameter } from '../parameters/settings-controller-pop-property.parameter';
import { SettingsControllerPopPropertyRemoteMethod } from '../remote-methods/settings-controller-pop-property.remote-method';
import { SettingsControllerPopPropertyResponse } from '../responses/settings-controller-pop-property.response';

@Directive({
  selector: '[settingsControllerPopPropertyRemoteMethod]',
  exportAs: 'settingsControllerPopPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerPopPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerPopPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>> {
  @Input('settingsControllerPopPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>;
  @Input('settingsControllerPopPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerPopPropertyRemoteMethod) remoteMethod: SettingsControllerPopPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerPopPropertyResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerPopPropertyRemoteMethod]',
  exportAs: 'settingsControllerPopPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerPopPropertyRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerPopPropertyResponse, OpenApiRemoteMethodParameter<SettingsControllerPopPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerPopPropertyRemoteMethod) remoteMethod: SettingsControllerPopPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
