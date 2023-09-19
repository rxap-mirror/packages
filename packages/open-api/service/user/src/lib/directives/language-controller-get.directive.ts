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
import { LanguageControllerGetRemoteMethod } from '../remote-methods/language-controller-get.remote-method';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Directive({
  selector: '[languageControllerGetRemoteMethod]',
  exportAs: 'languageControllerGetRemoteMethod',
  standalone: true,
})
export class LanguageControllerGetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<LanguageControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('languageControllerGetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('languageControllerGetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(LanguageControllerGetRemoteMethod) remoteMethod: LanguageControllerGetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<LanguageControllerGetResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[languageControllerGetRemoteMethod]',
  exportAs: 'languageControllerGetRemoteMethod',
  standalone: true,
})
export class LanguageControllerGetRemoteMethodDirective
  extends RemoteMethodDirective<LanguageControllerGetResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(LanguageControllerGetRemoteMethod) remoteMethod: LanguageControllerGetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
