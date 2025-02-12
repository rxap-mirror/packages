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
import { ChangelogControllerGetLatestParameter } from '../parameters/changelog-controller-get-latest.parameter';
import { ChangelogControllerGetLatestRemoteMethod } from '../remote-methods/changelog-controller-get-latest.remote-method';
import { ChangelogControllerGetLatestResponse } from '../responses/changelog-controller-get-latest.response';

@Directive({
  selector: '[changelogControllerGetLatestRemoteMethod]',
  exportAs: 'changelogControllerGetLatestRemoteMethod',
  standalone: true,
})
export class ChangelogControllerGetLatestRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerGetLatestResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>> {
  @Input('changelogControllerGetLatestRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>;
  @Input('changelogControllerGetLatestRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerGetLatestRemoteMethod) remoteMethod: ChangelogControllerGetLatestRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ChangelogControllerGetLatestResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[changelogControllerGetLatestRemoteMethod]',
  exportAs: 'changelogControllerGetLatestRemoteMethod',
  standalone: true,
})
export class ChangelogControllerGetLatestRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerGetLatestResponse, OpenApiRemoteMethodParameter<ChangelogControllerGetLatestParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerGetLatestRemoteMethod) remoteMethod: ChangelogControllerGetLatestRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
