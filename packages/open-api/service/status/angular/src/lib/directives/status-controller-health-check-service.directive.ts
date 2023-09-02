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
  StatusControllerHealthCheckServiceParameter,
  StatusControllerHealthCheckServiceResponse,
} from '@rxap/open-api-service-status';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { StatusControllerHealthCheckServiceRemoteMethod } from '../remote-methods/status-controller-health-check-service.remote-method';

@Directive({
  selector: '[rxapStatusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'rxapStatusControllerHealthCheckServiceRemoteMethod',
  standalone: true,
})
export class StatusControllerHealthCheckServiceRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
  @Input('rxapStatusControllerHealthCheckServiceRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>;
  @Input('rxapStatusControllerHealthCheckServiceRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckServiceRemoteMethod) remoteMethod: StatusControllerHealthCheckServiceRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<StatusControllerHealthCheckServiceResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[rxapStatusControllerHealthCheckServiceRemoteMethod]',
  exportAs: 'rxapStatusControllerHealthCheckServiceRemoteMethod',
  standalone: true,
})
export class StatusControllerHealthCheckServiceRemoteMethodDirective
  extends RemoteMethodDirective<StatusControllerHealthCheckServiceResponse, OpenApiRemoteMethodParameter<StatusControllerHealthCheckServiceParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(StatusControllerHealthCheckServiceRemoteMethod) remoteMethod: StatusControllerHealthCheckServiceRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
