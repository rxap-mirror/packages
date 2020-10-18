import {
  Input,
  NgModule,
  Output,
  EventEmitter,
  Directive,
  OnInit,
  HostListener,
  Inject,
  Injector,
  INJECTOR,
  isDevMode
} from '@angular/core';
import {
  RemoteMethodLoader,
  BaseRemoteMethodMetadata,
  BaseRemoteMethod
} from '@rxap/remote-method';
import {
  Required,
  coerceBoolean,
  ToggleSubject,
  Deprecated
} from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Directive({
  selector: '[rxapRemoteMethod]',
  exportAs: 'rxapRemoteMethod'
})
export class RemoteMethodDirective<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>
  implements OnInit {

  @Input('rxapRemoteMethod')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  @Input()
  public parameters?: Parameters;

  @Input()
  public metadata?: Metadata;

  @Output('executed')
  public executed$ = new EventEmitter();

  @Output('failure')
  public failure$ = new EventEmitter<Error>();

  @Output('successful')
  public successful$ = new EventEmitter<ReturnType>();

  @Input()
  public immediately: boolean = false;

  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  @Required
  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  private _hasConfirmDirective = false;

  constructor(
    @Inject(RemoteMethodLoader)
    protected readonly remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR)
    private readonly injector: Injector = Injector.NULL,
  ) {}

  public ngOnInit(): void {
    if (this.immediately) {
      this.execute();
    }
  }

  @HostListener('confirmed')
  public onConfirmed() {
    this.execute();
  }

  @HostListener('click')
  public onClick() {
    if (!this._hasConfirmDirective) {
      this.execute();
    } else {
      console.debug('skip remote method call. Wait for confirmation.');
    }
  }

  public async execute(): Promise<void> {
    this.executing$.enable();
    try {
      const result = await this.remoteMethodLoader.call$(this._remoteMethodOrIdOrToken, this.parameters, this.metadata, this.injector);
      this.executed(result);
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

  /**
   * @deprecated removed
   * @protected
   */
  @Deprecated('removed')
  protected async call(): Promise<any> {
    this.executing$.enable();
    const result = await this.remoteMethodLoader.call$(this._remoteMethodOrIdOrToken, this.parameters, this.metadata, this.injector);
    this.executing$.disable();
    return result;
  }

}

@NgModule({
  declarations: [ RemoteMethodDirective ],
  exports:      [ RemoteMethodDirective ]
})
export class RemoteMethodDirectiveModule {}
