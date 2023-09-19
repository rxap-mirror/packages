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
import { DarkModeControllerGetRemoteMethod } from '../remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';

@Directive({
  selector: '[darkModeControllerGetRemoteMethod]',
  exportAs: 'darkModeControllerGetRemoteMethod',
  standalone: true,
})
export class DarkModeControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('darkModeControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('darkModeControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerGetRemoteMethod) remoteMethod: DarkModeControllerGetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DarkModeControllerGetResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[darkModeControllerGetRemoteMethod]',
  exportAs: 'darkModeControllerGetRemoteMethod',
  standalone: true,
})
export class DarkModeControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerGetRemoteMethod) remoteMethod: DarkModeControllerGetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
