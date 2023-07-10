import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injector,
  INJECTOR,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  RemoteMethodTemplateDirective,
  RemoteMethodTemplateDirectiveContext,
  RemoteMethodTemplateDirectiveErrorContext,
} from '@rxap/remote-method/directive';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { GetSystemRolesRemoteMethod } from './get-system-roles.remote-method';

@Directive({
  selector: '[rxapGetSystemRolesRemoteMethod]',
  exportAs: 'rxapGetSystemRolesRemoteMethod',
  standalone: true,
})
export class GetSystemRolesRemoteMethodDirective extends RemoteMethodTemplateDirective<Record<string, string[]>, any> {

  @Input('rxapGetSystemRolesRemoteMethodParameters')
  public override parameters?: any;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapGetSystemRolesRemoteMethodError')
  public override errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  constructor(
    @Inject(RemoteMethodLoader) remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR) injector: Injector,
    @Inject(GetSystemRolesRemoteMethod) remoteMethod: GetSystemRolesRemoteMethod,
    @Inject(TemplateRef) template: TemplateRef<RemoteMethodTemplateDirectiveContext<Record<string, string[]>>>,
    @Inject(ViewContainerRef) viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(
      template,
      remoteMethodLoader,
      injector,
      viewContainerRef,
      cdr,
    );
    this.remoteMethodOrIdOrToken = remoteMethod;
    this.withoutParameters = true;
  }
}
