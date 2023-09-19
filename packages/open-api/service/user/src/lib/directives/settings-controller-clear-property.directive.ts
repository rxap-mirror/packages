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
import { SettingsControllerClearPropertyParameter } from '../parameters/settings-controller-clear-property.parameter';
import { SettingsControllerClearPropertyRemoteMethod } from '../remote-methods/settings-controller-clear-property.remote-method';

@Directive({
  selector: '[settingsControllerClearPropertyRemoteMethod]',
  exportAs: 'settingsControllerClearPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerClearPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>> {
  @Input('settingsControllerClearPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>;
  @Input('settingsControllerClearPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerClearPropertyRemoteMethod) remoteMethod: SettingsControllerClearPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerClearPropertyRemoteMethod]',
  exportAs: 'settingsControllerClearPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerClearPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerClearPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerClearPropertyRemoteMethod) remoteMethod: SettingsControllerClearPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
