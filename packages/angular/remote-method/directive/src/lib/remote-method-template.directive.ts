import { ChangeDetectorRef, Directive, Injector, INJECTOR, Input, isDevMode, OnInit, TemplateRef, ViewContainerRef, input, output, inject, linkedSignal, computed, effect, untracked } from '@angular/core';
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
  implements OnInit {
  private readonly template = inject<TemplateRef<RemoteMethodTemplateDirectiveContext<ReturnType>>>(TemplateRef);
  protected readonly remoteMethodLoader = inject<RemoteMethodLoader>(RemoteMethodLoader);
  private readonly injector = inject<Injector>(INJECTOR);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  protected readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly remoteMethodToken = inject<any>(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, { optional: true, self: true });


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
  protected readonly currentParameters = linkedSignal(() => this.parameters());
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly errorTemplate = input<TemplateRef<RemoteMethodTemplateDirectiveErrorContext>>(undefined, { alias: "rxapRemoteMethodError" });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly loadingTemplate = input<TemplateRef<void>>(undefined, { alias: "rxapRemoteMethodLoading" });
  public readonly withoutParameters = input(false, { alias: "rxapRemoteMethodWithoutParameters" });
  public readonly embedded = output();

  public readonly remoteMethodOrIdOrToken = input<IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>>(undefined, { alias: 'rxapRemoteMethodCall' });

  protected readonly _remoteMethodOrIdOrToken = computed(() => this.remoteMethodOrIdOrToken() || this.remoteMethodToken);

  // !! add generation of concrete template context guard to openapi schematics !!
  static ngTemplateContextGuard<T>(dir: RemoteMethodTemplateDirective<T>, ctx: any):
    ctx is RemoteMethodTemplateDirectiveContext<T> {
    return true;
  }

  constructor() {
    // re-run whenever the bound parameters change
    effect(() => {
      const parameters = this.parameters();
      if (parameters !== undefined) {
        untracked(() => this.execute(parameters));
      }
    });
  }

  public ngOnInit() {
    this.renderLoadingTemplate();
    if (this.withoutParameters()) {
      this.execute();
    }
  }

  public async execute(parameters: Parameters | undefined = this.currentParameters()): Promise<void> {
    this.executing$.enable();
    this.renderLoadingTemplate();
    try {
      const result = await this.remoteMethodLoader.call$(
        this._remoteMethodOrIdOrToken(),
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
    this.currentParameters.set({ ...(this.currentParameters() ?? {}), ...parameters } as any);
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


