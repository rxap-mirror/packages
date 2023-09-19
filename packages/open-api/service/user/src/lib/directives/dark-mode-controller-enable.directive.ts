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
import { DarkModeControllerEnableRemoteMethod } from '../remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerEnableResponse } from '../responses/dark-mode-controller-enable.response';

@Directive({
  selector: '[darkModeControllerEnableRemoteMethod]',
  exportAs: 'darkModeControllerEnableRemoteMethod',
  standalone: true,
})
export class DarkModeControllerEnableRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerEnableResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('darkModeControllerEnableRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('darkModeControllerEnableRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerEnableRemoteMethod) remoteMethod: DarkModeControllerEnableRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DarkModeControllerEnableResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[darkModeControllerEnableRemoteMethod]',
  exportAs: 'darkModeControllerEnableRemoteMethod',
  standalone: true,
})
export class DarkModeControllerEnableRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerEnableResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerEnableRemoteMethod) remoteMethod: DarkModeControllerEnableRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
