import { ChangeDetectorRef, Directive, HostListener, isDevMode, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewContainerRef, input, output, inject } from '@angular/core';
import { ToggleSubject } from '@rxap/rxjs';
import { Method } from '@rxap/pattern';

export interface MethodTemplateDirectiveContext<ReturnType = any> {
  $implicit: ReturnType;
}

export interface MethodTemplateDirectiveErrorContext {
  $implicit: Error;
  message: string;
}

@Directive({
  selector: '[rxapMethod]',
  exportAs: 'rxapMethod',
  standalone: true,
})
export class MethodTemplateDirective<ReturnType = any, Parameters = any> implements OnInit, OnChanges {
  private readonly template = inject<TemplateRef<MethodTemplateDirectiveContext<ReturnType>>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  protected readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);


  public readonly method = input.required<Method<ReturnType, Parameters>>({ alias: "rxapMethodCall" });
  public readonly parameters = input<Parameters>(undefined, { alias: "rxapMethodParameters" });
  public readonly errorTemplate = input<TemplateRef<MethodTemplateDirectiveErrorContext>>(undefined, { alias: "rxapMethodError" });
  public readonly loadingTemplate = input<TemplateRef<void>>(undefined, { alias: "rxapMethodLoading" });
  public readonly withoutParameters = input(false, { alias: "rxapMethodWithoutParameters" });
  public readonly immediately = input(false);
  public readonly executed$ = output({ alias: 'executed' });
  public readonly failure$ = output<Error>({ alias: 'failure' });
  public readonly successful$ = output<ReturnType>({ alias: 'successful' });
  /**
   * true - a remote method call is in progress
   */
  @Output('executing')
  public executing$ = new ToggleSubject();
  public readonly embedded = output();

  static ngTemplateContextGuard<T>(dir: MethodTemplateDirective<T>, ctx: any):
    ctx is MethodTemplateDirectiveContext<T> {
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

  @HostListener('confirmed')
  public onConfirmed() {
    return this.execute();
  }

  public async execute(parameters: Parameters | undefined = this.parameters()): Promise<void> {
    this.executing$.enable();
    try {
      const result = await this.method().call(parameters);
      this.executed(result);
      this.renderTemplate(result);
      this.successful(result);
    } catch (error: any) {
      if (isDevMode()) {
        console.error(`Method directive execution failed:`, error.message);
      }
      this.renderErrorTemplate(error);
      this.failure(error);
    } finally {
      this.executing$.disable();
    }
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

  protected renderErrorTemplate(error: Error) {
    const errorTemplate = this.errorTemplate();
    if (errorTemplate) {
      this.viewContainerRef.clear();
      if (errorTemplate) {
        this.viewContainerRef.createEmbeddedView(errorTemplate,
          {
            $implicit: error,
            message: error.message,
          },
        );
      }
    }
  }

  protected renderTemplate(result: ReturnType) {

    this.viewContainerRef.clear();

    try {
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: result });
    } catch (error: any) {
      this.renderErrorTemplate(error);
      console.error(error.message);
      throw error;
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


