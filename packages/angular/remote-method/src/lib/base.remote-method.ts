import {
  AbstractType,
  Inject,
  Injectable,
  InjectFlags,
  InjectionToken,
  Injector,
  INJECTOR,
  Optional,
  Type,
} from '@angular/core';
import { REMOTE_METHOD_META_DATA } from './tokens';
import {
  BaseDefinition,
  BaseDefinitionMetadata,
  DefinitionMetadata,
} from '@rxap/definition';
import { Subject } from 'rxjs';
import { RxapRemoteMethodError } from './error';
import { Refreshable } from '@rxap/utilities';
import { CounterSubject } from '@rxap/rxjs';

export interface BaseRemoteMethodMetadata extends BaseDefinitionMetadata {
  refresh?: Array<Type<Refreshable> | InjectionToken<Refreshable> | AbstractType<Refreshable>>;
}

export function RxapRemoteMethod<MetaData extends BaseDefinitionMetadata = BaseDefinitionMetadata>(
  metadataOrId: MetaData | string,
  className = 'BaseRemoteMethod',
  packageName = '@rxap/remote-method',
) {
  return function (target: any) {
    DefinitionMetadata(metadataOrId, className, packageName)(target);
  };
}

@Injectable()
export abstract class BaseRemoteMethod<ReturnType = any,
  Parameter = any,
  Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata> extends BaseDefinition<Metadata> {

  public executed$: Subject<ReturnType> = new Subject<ReturnType>();

  public executionsInProgress$: CounterSubject = new CounterSubject();

  public readonly injector: Injector;

  private _pauseRefresh = false;

  constructor(
    @Optional()
    @Inject(INJECTOR)
      injector: Injector | null = null,
    @Optional()
    @Inject(REMOTE_METHOD_META_DATA)
      metaData: any | null = null,
  ) {
    super(metaData);
    if (injector === undefined) {
      throw new RxapRemoteMethodError('Injector is undefined. Ensure that the Injector is added to the deps property!', '', this.constructor.name);
    }
    this.injector = injector ?? Injector.NULL;
    if (typeof this.injector.get !== 'function') {
      throw new RxapRemoteMethodError('The property injector is not Injector like. Check the deps property!', '', this.constructor.name);
    }
  }

  public async call(parameters?: Parameter): Promise<ReturnType> {
    this.init();
    this.executionsInProgress$.increase();
    const result = await this._call(parameters);
    this.executionsInProgress$.decrease();
    this.executed$.next(result);
    this.executed(result);
    return result;
  }

  public executed(result: ReturnType): void {
    if (!this._pauseRefresh) {
      this.refresh();
    }
  }

  public pauseRefresh(): void {
    this._pauseRefresh = true;
  }

  public resumeRefresh(): void {
    this._pauseRefresh = false;
  }

  public refresh(): void {
    if (this.metadata.refresh) {
      for (const refresh of this.metadata.refresh) {
        const canRefresh = this.injector.get(refresh, null, InjectFlags.Optional);
        if (canRefresh) {
          canRefresh.refresh();
        }
      }
    }
  }

  protected abstract _call(parameters?: Parameter): Promise<ReturnType> | ReturnType;

}


