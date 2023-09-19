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
import { DarkModeControllerToggleRemoteMethod } from '../remote-methods/dark-mode-controller-toggle.remote-method';
import { DarkModeControllerToggleResponse } from '../responses/dark-mode-controller-toggle.response';

@Directive({
  selector: '[darkModeControllerToggleRemoteMethod]',
  exportAs: 'darkModeControllerToggleRemoteMethod',
  standalone: true,
})
export class DarkModeControllerToggleRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<DarkModeControllerToggleResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('darkModeControllerToggleRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('darkModeControllerToggleRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerToggleRemoteMethod) remoteMethod: DarkModeControllerToggleRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<DarkModeControllerToggleResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[darkModeControllerToggleRemoteMethod]',
  exportAs: 'darkModeControllerToggleRemoteMethod',
  standalone: true,
})
export class DarkModeControllerToggleRemoteMethodDirective
  extends RemoteMethodDirective<DarkModeControllerToggleResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(DarkModeControllerToggleRemoteMethod) remoteMethod: DarkModeControllerToggleRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
