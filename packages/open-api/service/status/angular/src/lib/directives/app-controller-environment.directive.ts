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
import { AppControllerEnvironmentResponse } from '@rxap/open-api-service-status';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { AppControllerEnvironmentRemoteMethod } from '../remote-methods/app-controller-environment.remote-method';

@Directive({
  selector: '[rxapAppControllerEnvironmentRemoteMethod]',
  exportAs: 'rxapAppControllerEnvironmentRemoteMethod',
  standalone: true,
})
export class AppControllerEnvironmentRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('rxapAppControllerEnvironmentRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('rxapAppControllerEnvironmentRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerEnvironmentRemoteMethod) remoteMethod: AppControllerEnvironmentRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<AppControllerEnvironmentResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[rxapAppControllerEnvironmentRemoteMethod]',
  exportAs: 'rxapAppControllerEnvironmentRemoteMethod',
  standalone: true,
})
export class AppControllerEnvironmentRemoteMethodDirective
  extends RemoteMethodDirective<AppControllerEnvironmentResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(AppControllerEnvironmentRemoteMethod) remoteMethod: AppControllerEnvironmentRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
