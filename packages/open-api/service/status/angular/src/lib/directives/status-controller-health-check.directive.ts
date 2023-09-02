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
  StatusControllerHealthCheckParameter,
  StatusControllerHealthCheckResponse,
} from '@rxap/open-api-service-status';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerHealthCheckRemoteMethod } from '../remote-methods/status-controller-health-check.remote-method';

@Directive({
  selector: '[rxapStatusControllerHealthCheckRemoteMethod]',
  exportAs: 'rxapStatusControllerHealthCheckRemoteMethod',
  standalone: true,
})
export class StatusControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
  @Input('rxapStatusControllerHealthCheckRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>;
  @Input('rxapStatusControllerHealthCheckRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckRemoteMethod) remoteMethod: StatusControllerHealthCheckRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerHealthCheckResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[rxapStatusControllerHealthCheckRemoteMethod]',
  exportAs: 'rxapStatusControllerHealthCheckRemoteMethod',
  standalone: true,
})
export class StatusControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckRemoteMethod) remoteMethod: StatusControllerHealthCheckRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
