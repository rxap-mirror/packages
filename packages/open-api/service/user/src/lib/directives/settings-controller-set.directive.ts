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
import { SettingsControllerSetRemoteMethod } from '../remote-methods/settings-controller-set.remote-method';
import { SettingsControllerSetResponse } from '../responses/settings-controller-set.response';

@Directive({
  selector: '[settingsControllerSetRemoteMethod]',
  exportAs: 'settingsControllerSetRemoteMethod',
  standalone: true,
})
export class SettingsControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerSetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('settingsControllerSetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('settingsControllerSetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetRemoteMethod) remoteMethod: SettingsControllerSetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerSetResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[settingsControllerSetRemoteMethod]',
  exportAs: 'settingsControllerSetRemoteMethod',
  standalone: true,
})
export class SettingsControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerSetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetRemoteMethod) remoteMethod: SettingsControllerSetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
