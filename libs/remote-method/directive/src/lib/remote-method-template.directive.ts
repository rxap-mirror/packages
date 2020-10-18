import {
  Directive,
  TemplateRef,
  Inject,
  Input,
  Injector,
  INJECTOR,
  ViewContainerRef,
  ChangeDetectorRef,
  NgModule,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader
} from '@rxap/remote-method';
import { Required } from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';

export interface RemoteMethodTemplateDirectiveContext<ReturnType = any> {
  $implicit: ReturnType;
}

export interface RemoteMethodTemplateDirectiveErrorContext {
  $implicit: Error;
  message: string;
}

@Directive({
  selector: '[rxapRemoteMethod]',
  exportAs: 'rxapRemoteMethod'
})
export class RemoteMethodTemplateDirective<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>
  implements OnChanges, OnInit {

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(dir: RemoteMethodTemplateDirectiveContext<T>, ctx: any):
    ctx is RemoteMethodTemplateDirectiveContext<T> {
    return true;
  }

  @Input('rxapRemoteMethodCall')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  @Input('rxapRemoteMethodParameters')
  public parameters?: Parameters;

  @Input('rxapRemoteMethodError')
  public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  @Input('rxapRemoteMethodWithoutParameters')
  public withoutParameters: boolean = false;

  @Required
  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<RemoteMethodTemplateDirectiveContext<ReturnType>>,
    @Inject(RemoteMethodLoader)
    protected readonly remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnChanges(changes: SimpleChanges) {
    const parametersChanges = changes.parameters;
    if (parametersChanges) {
      this.call(parametersChanges.currentValue);
    }
  }

  public ngOnInit() {
    if (this.withoutParameters) {
      this.call();
    }
  }

  public call(parameters?: Parameters): void {
    this.renderTemplate(parameters)
        .catch(error => console.error('Remote method template rendering failed: ' + error.message));
  }

  public async renderTemplate(parameters?: Parameters) {

    this.viewContainerRef.clear();

    try {
      const result = await this.remoteMethodLoader.call$(this._remoteMethodOrIdOrToken, parameters, undefined, this.injector);
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
    } catch (error) {
      if (this.errorTemplate) {
        this.viewContainerRef.createEmbeddedView(this.errorTemplate, { $implicit: error, message: error.message });
      }
      console.error(error.message);
    }

    this.cdr.detectChanges();

  }

}

@NgModule({
  declarations: [RemoteMethodTemplateDirective],
  exports: [RemoteMethodTemplateDirective]
})
export class RemoteMethodTemplateDirectiveModule {}
