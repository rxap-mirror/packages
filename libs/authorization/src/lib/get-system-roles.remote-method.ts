import {HttpRemoteMethod} from '@rxap/remote-method/http';
import {RxapRemoteMethod} from '@rxap/remote-method';
import {Injectable} from '@angular/core';
import { Inject, Directive, NgModule, INJECTOR, Injector, TemplateRef, ChangeDetectorRef, ViewContainerRef, Input } from '@angular/core';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodTemplateDirective, RemoteMethodTemplateDirectiveContext, RemoteMethodTemplateDirectiveErrorContext } from '@rxap/remote-method/directive';

@RxapRemoteMethod({
  id: 'get-roles',
  url: '/roles.json',
  method: 'GET'
})
@Injectable({ providedIn: 'root' })
export class GetSystemRolesRemoteMethod extends HttpRemoteMethod<Record<string, string[]>> {}

@Directive({
    selector: '[rxapGetSystemRolesRemoteMethod]',
    exportAs: 'rxapGetSystemRolesRemoteMethod'
  })
export class GetSystemRolesRemoteMethodDirective extends RemoteMethodTemplateDirective<Record<string,string[]>, any> {
  @Input('rxapGetSystemRolesRemoteMethodParameters')
  public parameters?: any;
  @Input('rxapGetSystemRolesRemoteMethodError')
  public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(@Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader, @Inject(INJECTOR) injector: Injector, @Inject(GetSystemRolesRemoteMethod) remoteMethod: GetSystemRolesRemoteMethod, @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<Record<string,string[]>>>, @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef, @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef) {
    super(template, remoteMethodLoader, injector, viewContainerRef, cdr);
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}

@NgModule({
    declarations: [ GetSystemRolesRemoteMethodDirective ],
    exports: [ GetSystemRolesRemoteMethodDirective ]
  })
export class GetSystemRolesRemoteMethodDirectiveModule {
}
