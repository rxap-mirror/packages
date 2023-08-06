import {
  BaseDefinitionMetadata,
  GetDefinitionMetadata,
} from './definition.metadata';
import {
  deepMerge,
  GenerateRandomString,
  Required,
} from '@rxap/utilities';
import {
  Inject,
  Injectable,
  OnDestroy,
  Optional,
} from '@angular/core';
import { RXAP_DEFINITION_METADATA } from './tokens';
import { RxapDefinitionError } from './error';
import { Subject } from 'rxjs';

@Injectable()
export abstract class BaseDefinition<
  Metadata extends BaseDefinitionMetadata = BaseDefinitionMetadata
> implements OnDestroy {
  /**
   * A map of active Definition instances
   */
  public static readonly instances: Map<string, BaseDefinition> = new Map<
    string,
    BaseDefinition
  >();

  /**
   * Emits when a new Definition instance is initialised
   */
  public static readonly initialised$: Subject<BaseDefinition> =
    new Subject<BaseDefinition>();

  /**
   * Emits when a new Definition instance is initialised
   */
  public static readonly destroyed$: Subject<BaseDefinition> =
    new Subject<BaseDefinition>();

  public metadata!: Metadata;
  /**
   * Emits if the data source is destroyed
   */
  public readonly destroyed$: Subject<void> | undefined = new Subject<void>();
  /**
   * Emits if the data source is initialised
   */
  public readonly initialised$: Subject<void> | undefined = new Subject<void>();
  public readonly interceptors: Set<Subject<any>> | undefined = new Set<
    Subject<any>
  >();
  /**
   * unique internal id
   *
   * @internal
   */
  public __id = GenerateRandomString();
  protected _initialised = false;

  constructor(
    @Optional()
    @Inject(RXAP_DEFINITION_METADATA)
      metadata: BaseDefinitionMetadata | null = null,
  ) {
    if (metadata) {
      const decoratorMetadata = this.getMetadata();
      if (decoratorMetadata) {
        metadata = deepMerge(decoratorMetadata, metadata);
      }
    } else {
      metadata = this.getMetadata();
    }
    if (!metadata) {
      throw new RxapDefinitionError(
        'Definition metadata is not defined',
        '',
        this.constructor.name,
      );
    }
    this.metadata = metadata as Metadata;
  }

  public get id(): string {
    return this.metadata.id;
  }

  /**
   * @param definition
   */
  public static add(definition: BaseDefinition) {
    this.instances?.set(definition.__id, definition);
    this.initialised$?.next(definition);
  }

  /**
   * @param definition
   */
  public static remove(definition: BaseDefinition) {
    this.instances?.delete(definition.__id);
    this.destroyed$?.next(definition);
  }

  public getMetadata(): Metadata | null {
    return GetDefinitionMetadata(this.constructor);
  }

  public applyMetadata(partialMetadata: Partial<Metadata>): void {
    this.metadata = deepMerge<Metadata>(this.metadata, partialMetadata);
  }

  /**
   * @deprecated use ngOnDestroy instead
   */
  public destroy(): void {
    this.ngOnDestroy();
  }

  public ngOnDestroy() {
    this.destroyed$?.next();
    BaseDefinition.remove(this);
  }

  public init(): void {
    if (this._initialised) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (typeof self['ngOnInit'] === 'function') {
      self.ngOnInit();
    }
    this._initialised = true;
    this.initialised$?.next();
    BaseDefinition.add(this);
  }
}
