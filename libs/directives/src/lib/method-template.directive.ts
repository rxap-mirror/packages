import {
  Directive,
  NgModule,
  Input,
  Output,
  EventEmitter,
  HostListener,
  isDevMode,
  OnInit,
  TemplateRef,
  Inject,
  SimpleChanges,
  ViewContainerRef,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';
import {
  Method,
  ToggleSubject
} from '@rxap/utilities/rxjs';

export interface MethodTemplateDirectiveContext<ReturnType = any> {
  $implicit: ReturnType;
}

export interface MethodTemplateDirectiveErrorContext {
  $implicit: Error;
  message: string;
}

@Directive({
  selector: '[rxapMethod]',
  exportAs: 'rxapMethod'
})
export class MethodTemplateDirective<ReturnType = any, Parameters = any> implements OnInit, OnChanges {

  static ngTemplateContextGuard<T>(dir: MethodTemplateDirective<T>, ctx: any):
    ctx is MethodTemplateDirectiveContext<T> {
    return true;
  }

  @Input('rxapMethodCall')
  public method!: Method<ReturnType, Parameters>;
  @Input('rxapMethodParameters')
  public parameters?: Parameters;

  @Input('rxapMethodError')
  public errorTemplate?: TemplateRef<MethodTemplateDirectiveErrorContext>;

  @Input('rxapMethodLoading')
  public loadingTemplate?: TemplateRef<void>;

  @Input('rxapMethodWithoutParameters')
  public withoutParameters: boolean = false;

  @Input()
  public immediately: boolean = false;
  @Output('executed')
  public executed$            = new EventEmitter();
  @Output('failure')
  public failure$             = new EventEmitter<Error>();
  @Output('successful')
  public successful$          = new EventEmitter<ReturnType>();
  /**
   * true - a remote method call is in progress
   */
  @Output('executing')
  public executing$           = new ToggleSubject();

  @Output()
  public embedded = new EventEmitter();

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<MethodTemplateDirectiveContext<ReturnType>>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
  ) { }

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
      this.failure(error);
    } finally {
      this.executing$.disable();
    }
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
    } catch (error: any) {
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
  declarations: [ MethodTemplateDirective ],
  exports:      [ MethodTemplateDirective ]
})
export class MethodTemplateDirectiveModule {}
