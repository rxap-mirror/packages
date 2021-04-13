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
  OnInit,
  EventEmitter,
  Output,
  isDevMode,
  Optional,
  Self
} from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader
} from '@rxap/remote-method';
import {
  Required,
  ToggleSubject,
  Deprecated
} from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN } from './tokens';

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

  // TODO : remove template context Guard
  // the template context Guard must be defined with a concrete context type
  // else the context guard is resolved to any
  // For each child directive that should have a template context guard
  // the template context guard must be defined
  // !! add generation of concrete template context guard to openapi schematics !!
  static ngTemplateContextGuard(dir: RemoteMethodTemplateDirectiveContext, ctx: any):
    ctx is RemoteMethodTemplateDirectiveContext {
    return true;
  }

  @Input('rxapRemoteMethodCall')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  @Output('executed')
  public executed$ = new EventEmitter();

  @Output('failure')
  public failure$ = new EventEmitter<Error>();

  @Output('successful')
  public successful$ = new EventEmitter<ReturnType>();

  @Input('rxapRemoteMethodMetadata')
  public metadata?: Metadata;

  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  @Input('rxapRemoteMethodParameters')
  public parameters?: Parameters;

  @Input('rxapRemoteMethodError')
  public errorTemplate?: TemplateRef<RemoteMethodTemplateDirectiveErrorContext>;

  @Input('rxapRemoteMethodLoading')
  public loadingTemplate?: TemplateRef<void>;

  @Input('rxapRemoteMethodWithoutParameters')
  public withoutParameters: boolean = false;

  @Required
  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  @Output()
  public embedded = new EventEmitter();

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
    @Optional()
    @Self()
    @Inject(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN)
    private readonly remoteMethodToken?: any
  ) {
    if (this.remoteMethodToken) {
      this._remoteMethodOrIdOrToken = this.remoteMethodToken;
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    const parametersChanges = changes.parameters;
    if (parametersChanges) {
      this.execute(parametersChanges.currentValue);
    }
  }

  public ngOnInit() {
    this.renderLoadingTemplate();
    if (this.withoutParameters) {
      this.execute();
    }
  }

  public async execute(parameters: Parameters | undefined = this.parameters): Promise<void> {
    this.executing$.enable();
    this.renderLoadingTemplate();
    try {
      const result = await this.remoteMethodLoader.call$(this._remoteMethodOrIdOrToken, parameters, this.metadata, this.injector);
      this.executed(result);
      this.renderTemplate(result);
      this.successful(result);
    } catch (error) {
      if (isDevMode()) {
        console.error(`Remote method directive execution failed:`, error.message);
      }
      this.failure(error);
    } finally {
      this.executing$.disable();
    }
  }

  /**
   * @deprecated removed
   * @protected
   */
  @Deprecated('removed')
  public call(parameters?: Parameters): void {
    this.execute(parameters)
        .catch(error => console.error('Remote method template rendering failed: ' + error.message));
  }

  public setParameter<Key extends keyof Parameters>(parameterKey: Key, value: Parameters[Key]): void {
    this.updateParameters({ [ parameterKey ]: value } as any);
  }

  public updateParameters(parameters: Partial<Parameters>): void {
    this.parameters = { ...(this.parameters ?? {}), ...parameters } as any;
  }

  private renderLoadingTemplate() {
    if (this.loadingTemplate) {
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(this.loadingTemplate);
    }
  }

  protected executed(result: any) {
    this.executed$.emit(result);
  }

  protected failure(error: Error) {
    this.failure$.emit(error);
  }

  protected successful(result: ReturnType) {
    this.successful$.emit(result);
  }

  protected renderTemplate(result: ReturnType) {

    this.viewContainerRef.clear();

    try {
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
    } catch (error) {
      if (this.errorTemplate) {
        this.viewContainerRef.createEmbeddedView(this.errorTemplate, { $implicit: error, message: error.message });
      }
      console.error(error.message);
    }

    this.embedded.emit();

    this.cdr.detectChanges();

  }

}

@NgModule({
  declarations: [RemoteMethodTemplateDirective],
  exports: [RemoteMethodTemplateDirective]
})
export class RemoteMethodTemplateDirectiveModule {}
