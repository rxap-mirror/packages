import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  Input,
  IterableDiffers,
  NgZone,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveContext,
  RemoteMethodTemplateCollectionDirectiveErrorContext,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { ArrayElement } from '@rxap/utilities';
import { ChangelogControllerListRemoteMethod } from '../remote-methods/changelog-controller-list.remote-method';
import { ChangelogControllerListResponse } from '../responses/changelog-controller-list.response';

@Directive({
  selector: '[changelogControllerListCollectionRemoteMethod]',
  exportAs: 'changelogControllerListCollectionRemoteMethod',
  standalone: true,
})
export class ChangelogControllerListRemoteMethodTemplateCollectionDirective
  extends RemoteMethodTemplateCollectionDirective<ArrayElement<ChangelogControllerListResponse>, OpenApiRemoteMethodParameter<void, void>> {
  @Input('changelogControllerListCollectionRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('changelogControllerListCollectionRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;
  @Input('changelogControllerListCollectionRemoteMethodEmpty')
  declare public emptyTemplate?: TemplateRef<void>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerListRemoteMethod) remoteMethod: ChangelogControllerListRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ArrayElement<ChangelogControllerListResponse>>>,
    @Inject(IterableDiffers) differs: IterableDiffers,
    @Inject(NgZone) zone: NgZone,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr, differs, zone);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[changelogControllerListRemoteMethod]',
  exportAs: 'changelogControllerListRemoteMethod',
  standalone: true,
})
export class ChangelogControllerListRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<ChangelogControllerListResponse, OpenApiRemoteMethodParameter<void, void>> {
  @Input('changelogControllerListRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<void, void>;
  @Input('changelogControllerListRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerListRemoteMethod) remoteMethod: ChangelogControllerListRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<ChangelogControllerListResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@Directive({
  selector: '[changelogControllerListRemoteMethod]',
  exportAs: 'changelogControllerListRemoteMethod',
  standalone: true,
})
export class ChangelogControllerListRemoteMethodDirective
  extends RemoteMethodDirective<ChangelogControllerListResponse, OpenApiRemoteMethodParameter<void, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(ChangelogControllerListRemoteMethod) remoteMethod: ChangelogControllerListRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
