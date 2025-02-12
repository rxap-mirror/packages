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
import { ThemeControllerSetTypographyRemoteMethod } from '../remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetTypographyRequestBody } from '../request-bodies/theme-controller-set-typography.request-body';

@Directive({
  selector: '[themeControllerSetTypographyRemoteMethod]',
  exportAs: 'themeControllerSetTypographyRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetTypographyRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>> {
  @Input('themeControllerSetTypographyRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>;
  @Input('themeControllerSetTypographyRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetTypographyRemoteMethod) remoteMethod: ThemeControllerSetTypographyRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[themeControllerSetTypographyRemoteMethod]',
  exportAs: 'themeControllerSetTypographyRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetTypographyRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetTypographyRequestBody>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetTypographyRemoteMethod) remoteMethod: ThemeControllerSetTypographyRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
