import {
  Directive,
  EventEmitter,
  HostListener,
  Inject,
  Injector,
  INJECTOR,
  Input,
  isDevMode,
  OnInit,
  Optional,
  Output,
  Self,
} from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader,
} from '@rxap/remote-method';
import {
  coerceBoolean,
  Deprecated,
  Required,
} from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN } from './tokens';
import { ToggleSubject } from '@rxap/rxjs';

@Directive({
  selector: '[rxapRemoteMethod]',
  exportAs: 'rxapRemoteMethod',
  standalone: true,
})
export class RemoteMethodDirective<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>
  implements OnInit {

  @Input()
  public parameters?: Parameters;
  @Input()
  public metadata?: Metadata;
  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('executed')
  public executed$ = new EventEmitter();
  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('failure')
  public failure$ = new EventEmitter<Error>();
  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('successful')
  public successful$ = new EventEmitter<ReturnType>();
  @Input()
  public immediately = false;
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  constructor(
    @Inject(RemoteMethodLoader)
    protected readonly remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR)
    private readonly injector: Injector = Injector.NULL,
    @Optional()
    @Self()
    @Inject(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN)
    private readonly remoteMethodToken?: any,
  ) {
    if (this.remoteMethodToken) {
      this._remoteMethodOrIdOrToken = this.remoteMethodToken;
    }
  }

  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  @Input('rxapRemoteMethod')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  private _hasConfirmDirective = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

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
      const result = await this.remoteMethodLoader.call$(
        this._remoteMethodOrIdOrToken,
        this.parameters,
        this.metadata,
        this.injector,
      );
      this.executed(result);
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
    const result = await this.remoteMethodLoader.call$(
      this._remoteMethodOrIdOrToken,
      this.parameters,
      this.metadata,
      this.injector,
    );
    this.executing$.disable();
    return result;
  }

}


