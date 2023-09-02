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
import {
  StatusControllerRegisterRequestBody,
  StatusControllerRegisterResponse,
} from '@rxap/open-api-service-status';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerRegisterRemoteMethod } from '../remote-methods/status-controller-register.remote-method';

@Directive({
  selector: '[statusControllerRegisterRemoteMethod]',
  exportAs: 'statusControllerRegisterRemoteMethod',
  standalone: true,
})
export class StatusControllerRegisterRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerRegisterResponse, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
  @Input('statusControllerRegisterRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>;
  @Input('statusControllerRegisterRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerRegisterRemoteMethod) remoteMethod: StatusControllerRegisterRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerRegisterResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[statusControllerRegisterRemoteMethod]',
  exportAs: 'statusControllerRegisterRemoteMethod',
  standalone: true,
})
export class StatusControllerRegisterRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerRegisterResponse, OpenApiRemoteMethodParameter<void, StatusControllerRegisterRequestBody>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerRegisterRemoteMethod) remoteMethod: StatusControllerRegisterRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
