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
import { HealthControllerHealthCheckRemoteMethod } from '../remote-methods/health-controller-health-check.remote-method';
import { HealthControllerHealthCheckResponse } from '../responses/health-controller-health-check.response';

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
  standalone: true,
})
export class HealthControllerHealthCheckRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('healthControllerHealthCheckRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('healthControllerHealthCheckRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(HealthControllerHealthCheckRemoteMethod) remoteMethod: HealthControllerHealthCheckRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<HealthControllerHealthCheckResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[healthControllerHealthCheckRemoteMethod]',
  exportAs: 'healthControllerHealthCheckRemoteMethod',
  standalone: true,
})
export class HealthControllerHealthCheckRemoteMethodDirective
  extends RemoteMethodDirective<HealthControllerHealthCheckResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(HealthControllerHealthCheckRemoteMethod) remoteMethod: HealthControllerHealthCheckRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
