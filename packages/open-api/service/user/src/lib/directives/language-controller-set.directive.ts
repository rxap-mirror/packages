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
import { LanguageControllerSetParameter } from '../parameters/language-controller-set.parameter';
import { LanguageControllerSetRemoteMethod } from '../remote-methods/language-controller-set.remote-method';
import { LanguageControllerSetResponse } from '../responses/language-controller-set.response';

@Directive({
  selector: '[languageControllerSetRemoteMethod]',
  exportAs: 'languageControllerSetRemoteMethod',
  standalone: true,
})
export class LanguageControllerSetRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<LanguageControllerSetResponse, OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>> {
  @Input('languageControllerSetRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>;
  @Input('languageControllerSetRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(LanguageControllerSetRemoteMethod) remoteMethod: LanguageControllerSetRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<LanguageControllerSetResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[languageControllerSetRemoteMethod]',
  exportAs: 'languageControllerSetRemoteMethod',
  standalone: true,
})
export class LanguageControllerSetRemoteMethodDirective
  extends RemoteMethodDirective<LanguageControllerSetResponse, OpenApiRemoteMethodParameter<LanguageControllerSetParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(LanguageControllerSetRemoteMethod) remoteMethod: LanguageControllerSetRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
