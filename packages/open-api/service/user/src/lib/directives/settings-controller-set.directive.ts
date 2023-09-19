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
import { SettingsControllerSetRemoteMethod } from '../remote-methods/settings-controller-set.remote-method';
import { SettingsControllerSetRequestBody } from '../request-bodies/settings-controller-set.request-body';

@Directive({
  selector: '[settingsControllerSetRemoteMethod]',
  exportAs: 'settingsControllerSetRemoteMethod',
  standalone: true,
})
export class SettingsControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>> {
  @Input('settingsControllerSetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>;
  @Input('settingsControllerSetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetRemoteMethod) remoteMethod: SettingsControllerSetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
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
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, SettingsControllerSetRequestBody<TRequestBody>>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(SettingsControllerSetRemoteMethod) remoteMethod: SettingsControllerSetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
