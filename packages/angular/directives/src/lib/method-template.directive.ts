import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  isDevMode,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
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

  @Input('rxapMethodCall')
  public method!: Method<ReturnType, Parameters>;
  @Input('rxapMethodParameters')
  public parameters?: Parameters;
  @Input('rxapMethodError')
  public errorTemplate?: TemplateRef<MethodTemplateDirectiveErrorContext>;
  @Input('rxapMethodLoading')
  public loadingTemplate?: TemplateRef<void>;
  @Input('rxapMethodWithoutParameters')
  public withoutParameters = false;
  @Input()
  public immediately = false;
  @Output('executed')
  public executed$ = new EventEmitter();
  @Output('failure')
  public failure$ = new EventEmitter<Error>();
  @Output('successful')
  public successful$ = new EventEmitter<ReturnType>();
  /**
   * true - a remote method call is in progress
   */
  @Output('executing')
  public executing$ = new ToggleSubject();
  @Output()
  public embedded = new EventEmitter();

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<MethodTemplateDirectiveContext<ReturnType>>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
  ) {
  }

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
    if (this.withoutParameters) {
      this.execute();
    }
  }

  @HostListener('confirmed')
  public onConfirmed() {
    return this.execute();
  }

  public async execute(parameters: Parameters | undefined = this.parameters): Promise<void> {
    this.executing$.enable();
    try {
      const result = await this.method.call(parameters);
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
    this.parameters = { ...(this.parameters ?? {}), ...parameters } as any;
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
    if (this.errorTemplate) {
      this.viewContainerRef.clear();
      if (this.errorTemplate) {
        this.viewContainerRef.createEmbeddedView(this.errorTemplate,
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
    if (this.loadingTemplate) {
      this.viewContainerRef.clear();
      this.viewContainerRef.createEmbeddedView(this.loadingTemplate);
    }
  }

}


