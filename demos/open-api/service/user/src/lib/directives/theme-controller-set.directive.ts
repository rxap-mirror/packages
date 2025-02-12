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
import { ThemeControllerSetRemoteMethod } from '../remote-methods/theme-controller-set.remote-method';
import { ThemeControllerSetRequestBody } from '../request-bodies/theme-controller-set.request-body';

@Directive({
  selector: '[themeControllerSetRemoteMethod]',
  exportAs: 'themeControllerSetRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>> {
  @Input('themeControllerSetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>;
  @Input('themeControllerSetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetRemoteMethod) remoteMethod: ThemeControllerSetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[themeControllerSetRemoteMethod]',
  exportAs: 'themeControllerSetRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetRequestBody<TRequestBody>>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetRemoteMethod) remoteMethod: ThemeControllerSetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
