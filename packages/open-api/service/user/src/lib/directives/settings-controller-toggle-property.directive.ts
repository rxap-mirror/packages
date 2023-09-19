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
import { SettingsControllerTogglePropertyParameter } from '../parameters/settings-controller-toggle-property.parameter';
import { SettingsControllerTogglePropertyRemoteMethod } from '../remote-methods/settings-controller-toggle-property.remote-method';

@Directive({
  selector: '[settingsControllerTogglePropertyRemoteMethod]',
  exportAs: 'settingsControllerTogglePropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerTogglePropertyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>> {
  @Input('settingsControllerTogglePropertyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>;
  @Input('settingsControllerTogglePropertyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerTogglePropertyRemoteMethod) remoteMethod: SettingsControllerTogglePropertyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[settingsControllerTogglePropertyRemoteMethod]',
  exportAs: 'settingsControllerTogglePropertyRemoteMethod',
  standalone: true,
})
export class SettingsControllerTogglePropertyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<SettingsControllerTogglePropertyParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerTogglePropertyRemoteMethod) remoteMethod: SettingsControllerTogglePropertyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
