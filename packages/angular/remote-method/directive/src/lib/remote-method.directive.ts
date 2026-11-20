import { Directive, HostListener, Injector, INJECTOR, Input, isDevMode, OnInit, input, output, inject } from '@angular/core';
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
  protected readonly remoteMethodLoader = inject<RemoteMethodLoader>(RemoteMethodLoader);
  private readonly injector = inject<Injector>(INJECTOR) ?? Injector.NULL;
  private readonly remoteMethodToken = inject(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, { optional: true, self: true });


  public readonly parameters = input<Parameters>();
  public readonly metadata = input<Metadata>();
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly executed$ = output({ alias: 'executed' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly failure$ = output<Error>({ alias: 'failure' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly successful$ = output<ReturnType>({ alias: 'successful' });
  public readonly immediately = input(false);
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  constructor() {
    if (this.remoteMethodToken) {
      this._remoteMethodOrIdOrToken = this.remoteMethodToken;
    }
  }

  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>;

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapRemoteMethod')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

  private _hasConfirmDirective = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  public ngOnInit(): void {
    if (this.immediately()) {
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
        this.parameters(),
        this.metadata(),
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

  /**
   * @deprecated removed
   * @protected
   */
  @Deprecated('removed')
  protected async call(): Promise<any> {
    this.executing$.enable();
    const result = await this.remoteMethodLoader.call$(
      this._remoteMethodOrIdOrToken,
      this.parameters(),
      this.metadata(),
      this.injector,
    );
    this.executing$.disable();
    return result;
  }

}


