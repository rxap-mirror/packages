import { Directive, HostListener, Injector, INJECTOR, Input, isDevMode, OnInit, input, output, inject, linkedSignal, computed } from '@angular/core';
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
  private readonly remoteMethodToken = inject<any>(RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, { optional: true, self: true });


  public readonly parameters = input<Parameters>();
  protected readonly currentParameters = linkedSignal(() => this.parameters());
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

  public readonly remoteMethodOrIdOrToken = input<IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>>(undefined, { alias: 'rxapRemoteMethod' });

  protected readonly _remoteMethodOrIdOrToken = computed(() => this.remoteMethodOrIdOrToken() || this.remoteMethodToken);

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

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
    if (!this.hasConfirmDirective()) {
      this.execute();
    } else {
      console.debug('skip remote method call. Wait for confirmation.');
    }
  }

  public async execute(): Promise<void> {
    this.executing$.enable();
    try {
      const result = await this.remoteMethodLoader.call$(
        this._remoteMethodOrIdOrToken(),
        this.currentParameters(),
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

  /**
   * @deprecated removed
   * @protected
   */
  @Deprecated('removed')
  protected async call(): Promise<any> {
    this.executing$.enable();
    const result = await this.remoteMethodLoader.call$(
      this._remoteMethodOrIdOrToken(),
      this.currentParameters(),
      this.metadata(),
      this.injector,
    );
    this.executing$.disable();
    return result;
  }

}


