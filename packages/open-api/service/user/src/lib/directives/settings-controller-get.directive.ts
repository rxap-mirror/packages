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
import { SettingsControllerGetRemoteMethod } from '../remote-methods/settings-controller-get.remote-method';
import { SettingsControllerGetResponse } from '../responses/settings-controller-get.response';

@Directive({
  selector: '[settingsControllerGetRemoteMethod]',
  exportAs: 'settingsControllerGetRemoteMethod',
  standalone: true,
})
export class SettingsControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<SettingsControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('settingsControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('settingsControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerGetRemoteMethod) remoteMethod: SettingsControllerGetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<SettingsControllerGetResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[settingsControllerGetRemoteMethod]',
  exportAs: 'settingsControllerGetRemoteMethod',
  standalone: true,
})
export class SettingsControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<SettingsControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerGetRemoteMethod) remoteMethod: SettingsControllerGetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
