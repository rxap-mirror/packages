import { HttpRemoteMethod } from '@rxap/remote-method/http';
import { RxapRemoteMethod, RemoteMethodLoader } from '@rxap/remote-method';
import type { Injector } from '@angular/core';
import {
  Injectable,
  Inject,
  Directive,
  NgModule,
  INJECTOR,
  TemplateRef,
  ChangeDetectorRef,
  ViewContainerRef,
  Input,
} from '@angular/core';
import {
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';

@RxapRemoteMethod({
  id: 'get-roles',
  url: 'roles.json',
  method: 'GET',
})
@Injectable({ providedIn: 'root' })
export class GetSystemRolesRemoteMethod extends HttpRemoteMethod<
  Record<string, string[]>
> {}

@Directive({
  selector: '[rxapGetSystemRolesRemoteMethod]',
  exportAs: 'rxapGetSystemRolesRemoteMethod',
})
export class GetSystemRolesRemoteMethodDirective extends RemoteMethodTemplateDirective<
  Record<string, string[]>,
  any
> {
  @Input('rxapGetSystemRolesRemoteMethodParameters')
  public parameters?: any;
  @Input('rxapGetSystemRolesRemoteMethodError')
  public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(GetSystemRolesRemoteMethod)
    remoteMethod: GetSystemRolesRemoteMethod,
    @Inject(TemplateRef)
    template: TemplateRef<
      RemoteMethodTemplateDirectiveContext<Record<string, string[]>>
    >,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef
  ) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
  declarations: [GetSystemRolesRemoteMethodDirective],
  exports: [GetSystemRolesRemoteMethodDirective],
})
export class GetSystemRolesRemoteMethodDirectiveModule {}
