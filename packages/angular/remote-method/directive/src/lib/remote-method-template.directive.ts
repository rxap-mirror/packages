import { ChangeDetectorRef, Directive, Injector, INJECTOR, Input, isDevMode, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewContainerRef, input, output, inject } from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader,
} from '@rxap/remote-method';
import {
  Deprecated,
  Required,
} from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN } from './tokens';
import { ToggleSubject } from '@rxap/rxjs';

export interface RemoteMethodTemplateDirectiveContext<ReturnType = any> {
  $implicit: ReturnType;
}

export interface RemoteMethodTemplateDirectiveErrorContext {
  $implicit: Error;
  message: string;
}

@Directive({
  selector: '[rxapRemoteMethod]',
  exportAs: 'rxapRemoteMethod',
  standalone: true,
})
export class RemoteMethodTemplateDirective<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>
  implements OnChanges, OnInit {
  private readonly template = inject<TemplateRef<RemoteMethodTemplateDirectiveContext<ReturnType>>>(TemplateRef);
  protected readonly remoteMethodLoader = inject<RemoteMethodLoader>(RemoteMethodLoader);
  private readonly injector = inject<Injector>(INJECTOR);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  protected readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly remoteMethodToken = inject(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, { optional: true, self: true });


  // TODO : remove template context Guard
  // the template context Guard must be defined with a concrete context type
  // else the context guard is resolved to any
  // For each child directive that should have a template context guard
  // the template context guard must be defined
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly executed$ = output({ alias: 'executed' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly failure$ = output<Error>({ alias: 'failure' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly successful$ = output<ReturnType>({ alias: 'successful' });
  public readonly metadata = input<Metadata>(undefined, { alias: "rxapRemoteMethodMetadata" });
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();
  public readonly parameters = input<Parameters>(undefined, { alias: "rxapRemoteMethodParameters" });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: "rxapRemoteMethodError" });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly loadingTemplate = input<TemplateRef<void>>(undefined, { alias: "rxapRemoteMethodLoading" });
  public readonly withoutParameters = input(false, { alias: "rxapRemoteMethodWithoutParameters" });
  public readonly embedded = output();

  constructor() {
    if (this.remoteMethodToken) {
      this._remoteMethodOrIdOrToken = this.remoteMethodToken;
    }
  }

  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapRemoteMethodCall')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  // !! add generation of concrete template context guard to openapi schematics !!
  static ngTemplateContextGuard<T>(dir: RemoteMethodTemplateDirective<T>, ctx: any):
    ctx is RemoteMethodTemplateDirectiveContext<T> {
    return true;
  }

  public ngOnChanges(changes: SimpleChanges) {
    const parametersChanges = changes['parameters'];
    if (parametersChanges) {
      this.execute(parametersChanges.currentValue);
    }
  }

  public ngOnInit() {
    this.renderLoadingTemplate();
    if (this.withoutParameters()) {
      this.execute();
    }
  }

  public async execute(parameters: Parameters | undefined = this.parameters()): Promise<void> {
    this.executing$.enable();
    this.renderLoadingTemplate();
    try {
      const result = await this.remoteMethodLoader.call$(
        this._remoteMethodOrIdOrToken,
        parameters,
        this.metadata(),
        this.injector,
      );
      this.executed(result);
      this.renderTemplate(result);
      this.successful(result);
    } catch (error: any) {
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
    this.updateParameters({ [parameterKey]: value } as any);
  }

  public updateParameters(parameters: Partial<Parameters>): void {
    this.parameters = { ...(this.parameters() ?? {}), ...parameters } as any;
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
    } catch (error: any) {
      const errorTemplate = this.errorTemplate();
      if (errorTemplate) {
        this.viewContainerRef.createEmbeddedView(
          errorTemplate,
          {
            $implicit: error,
            message: error.message,
          },
        );
      }
      console.error(error.message);
    }

    this.embedded.emit();

    this.cdr.detectChanges();

  }

  private renderLoadingTemplate() {
    const loadingTemplate = this.loadingTemplate();
    if (loadingTemplate) {
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(loadingTemplate);
    }
  }

}


