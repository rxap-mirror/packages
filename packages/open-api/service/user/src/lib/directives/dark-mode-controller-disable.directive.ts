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
import { DarkModeControllerDisableRemoteMethod } from '../remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerDisableResponse } from '../responses/dark-mode-controller-disable.response';

@Directive({
  selector: '[darkModeControllerDisableRemoteMethod]',
  exportAs: 'darkModeControllerDisableRemoteMethod',
  standalone: true,
})
export class DarkModeControllerDisableRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerDisableResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('darkModeControllerDisableRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('darkModeControllerDisableRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerDisableRemoteMethod) remoteMethod: DarkModeControllerDisableRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DarkModeControllerDisableResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[darkModeControllerDisableRemoteMethod]',
  exportAs: 'darkModeControllerDisableRemoteMethod',
  standalone: true,
})
export class DarkModeControllerDisableRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerDisableResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerDisableRemoteMethod) remoteMethod: DarkModeControllerDisableRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
