import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
  RxapOpenApiRemoteMethod,
} from '@rxap/open-api/remote-method';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodDirective,
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiRemoteMethod('MinimumTableController_getPage')
export class MinimumTableControllerGetPageRemoteMethod
  extends OpenApiRemoteMethod<MinimumTableControllerGetPageResponse, MinimumTableControllerGetPageParameter, void> {
  public override call(parameters: OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>): Promise<MinimumTableControllerGetPageResponse> {
    return super.call(parameters);
  }
}

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
})
export class MinimumTableControllerGetPageRemoteMethodTemplateDirective
  extends RemoteMethodTemplateDirective<MinimumTableControllerGetPageResponse, OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>> {
  @Input('minimumTableControllerGetPageRemoteMethodParameters')
  public override parameters?: OpenApiRemoteMethodParameter<MinimumTableControllerGetPageParameter, void>;
  @Input('minimumTableControllerGetPageRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

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

@NgModule({
  declarations: [ MinimumTableControllerGetPageRemoteMethodTemplateDirective ],
  exports: [ MinimumTableControllerGetPageRemoteMethodTemplateDirective ],
})
export class MinimumTableControllerGetPageRemoteMethodTemplateDirectiveModule {
}

@Directive({
  selector: '[minimumTableControllerGetPageRemoteMethod]',
  exportAs: 'minimumTableControllerGetPageRemoteMethod',
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

@NgModule({
  declarations: [ MinimumTableControllerGetPageRemoteMethodDirective ],
  exports: [ MinimumTableControllerGetPageRemoteMethodDirective ],
})
export class MinimumTableControllerGetPageRemoteMethodDirectiveModule {
}
