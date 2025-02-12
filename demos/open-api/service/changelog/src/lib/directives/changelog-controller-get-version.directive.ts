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
import { ChangelogControllerGetVersionParameter } from '../parameters/changelog-controller-get-version.parameter';
import { ChangelogControllerGetVersionRemoteMethod } from '../remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerGetVersionResponse } from '../responses/changelog-controller-get-version.response';

@Directive({
  selector: '[changelogControllerGetVersionRemoteMethod]',
  exportAs: 'changelogControllerGetVersionRemoteMethod',
  standalone: true,
})
export class ChangelogControllerGetVersionRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerGetVersionResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>> {
  @Input('changelogControllerGetVersionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>;
  @Input('changelogControllerGetVersionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerGetVersionRemoteMethod) remoteMethod: ChangelogControllerGetVersionRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ChangelogControllerGetVersionResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[changelogControllerGetVersionRemoteMethod]',
  exportAs: 'changelogControllerGetVersionRemoteMethod',
  standalone: true,
})
export class ChangelogControllerGetVersionRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerGetVersionResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetVersionParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerGetVersionRemoteMethod) remoteMethod: ChangelogControllerGetVersionRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
