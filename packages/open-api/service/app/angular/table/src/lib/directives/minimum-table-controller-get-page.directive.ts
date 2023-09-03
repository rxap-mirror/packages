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
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageRemoteMethod } from '../remote-methods/minimum-table-controller-get-page.remote-method';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
  standalone: true,
})
export class MinimumTableControllerGetPageRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<MinimumTableControllerGetPageResponse, OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>> {
  @Input('minimumTableControllerGetPageRemoteMethodParameters')
  declare public parameters?: OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>;
  @Input('minimumTableControllerGetPageRemoteMethodError')
  declare public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(MinimumTableControllerGetPageRemoteMethod) remoteMethod: MinimumTableControllerGetPageRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<MinimumTableControllerGetPageResponse>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
  standalone: true,
})
export class MinimumTableControllerGetPageRemoteMethodDirective
  extends RemoteMethodDirective<MinimumTableControllerGetPageResponse, OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>> {
  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(MinimumTableControllerGetPageRemoteMethod) remoteMethod: MinimumTableControllerGetPageRemoteMethod,
  ) {
    super(remoteMethodLoader, injector);
    this.remoteMethodOrIdOrToken = remoteMethod;
  }
}
