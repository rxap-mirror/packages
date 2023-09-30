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
import { ThemeControllerSetDensityRemoteMethod } from '../remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetDensityRequestBody } from '../request-bodies/theme-controller-set-density.request-body';

@Directive({
  selector: '[themeControllerSetDensityRemoteMethod]',
  exportAs: 'themeControllerSetDensityRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetDensityRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>> {
  @Input('themeControllerSetDensityRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>;
  @Input('themeControllerSetDensityRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetDensityRemoteMethod) remoteMethod: ThemeControllerSetDensityRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[themeControllerSetDensityRemoteMethod]',
  exportAs: 'themeControllerSetDensityRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetDensityRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetDensityRequestBody>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetDensityRemoteMethod) remoteMethod: ThemeControllerSetDensityRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
