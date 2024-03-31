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
import { ThemeControllerSetPresetRemoteMethod } from '../remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetPresetRequestBody } from '../request-bodies/theme-controller-set-preset.request-body';

@Directive({
  selector: '[themeControllerSetPresetRemoteMethod]',
  exportAs: 'themeControllerSetPresetRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetPresetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>> {
  @Input('themeControllerSetPresetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>;
  @Input('themeControllerSetPresetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetPresetRemoteMethod) remoteMethod: ThemeControllerSetPresetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<void>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[themeControllerSetPresetRemoteMethod]',
  exportAs: 'themeControllerSetPresetRemoteMethod',
  standalone: true,
})
export class ThemeControllerSetPresetRemoteMethodDirective
  extends RemoteMethodDirective<void, OpenApiRemoteMethodParameter<void, ThemeControllerSetPresetRequestBody>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector,
    @Inject(ThemeControllerSetPresetRemoteMethod) remoteMethod: ThemeControllerSetPresetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
