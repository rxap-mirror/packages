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
import { ThemeControllerGetRemoteMethod } from '../remote-methods/theme-controller-get.remote-method';
import { ThemeControllerGetResponse } from '../responses/theme-controller-get.response';

@Directive({
  selector: '[themeControllerGetRemoteMethod]',
  exportAs: 'themeControllerGetRemoteMethod',
  standalone: true,
})
export class ThemeControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ThemeControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('themeControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('themeControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerGetRemoteMethod) remoteMethod: ThemeControllerGetRemoteMethod, @Inject(
      TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ThemeControllerGetResponse<TResponse>>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[themeControllerGetRemoteMethod]',
  exportAs: 'themeControllerGetRemoteMethod',
  standalone: true,
})
export class ThemeControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<ThemeControllerGetResponse<TResponse>, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerGetRemoteMethod) remoteMethod: ThemeControllerGetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
