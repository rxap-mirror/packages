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
import { SettingsControllerIncrementPropertyParameter } from '../parameters/settings-controller-increment-property.parameter';
import { SettingsControllerIncrementPropertyRemoteMethod } from '../remote-methods/settings-controller-increment-property.remote-method';

@Directive({
  selector: '[settingsControllerIncrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerIncrementPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerIncrementPropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>> {
  @Input('settingsControllerIncrementPropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>;
  @Input('settingsControllerIncrementPropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerIncrementPropertyRemoteMethod) remoteMethod: SettingsControllerIncrementPropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerIncrementPropertyRemoteMethod]',
  exportAs: 'settingsControllerIncrementPropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerIncrementPropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerIncrementPropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerIncrementPropertyRemoteMethod) remoteMethod: SettingsControllerIncrementPropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
