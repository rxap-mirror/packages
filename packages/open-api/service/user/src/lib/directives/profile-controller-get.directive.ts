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
import { ProfileControllerGetRemoteMethod } from '../remote-methods/profile-controller-get.remote-method';
import { ProfileControllerGetResponse } from '../responses/profile-controller-get.response';

@Directive({
  selector: '[profileControllerGetRemoteMethod]',
  exportAs: 'profileControllerGetRemoteMethod',
  standalone: true,
})
export class ProfileControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ProfileControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('profileControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('profileControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ProfileControllerGetRemoteMethod) remoteMethod: ProfileControllerGetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ProfileControllerGetResponse<TResponse>>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[profileControllerGetRemoteMethod]',
  exportAs: 'profileControllerGetRemoteMethod',
  standalone: true,
})
export class ProfileControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<ProfileControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ProfileControllerGetRemoteMethod) remoteMethod: ProfileControllerGetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
