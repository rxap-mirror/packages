import { IdOrInstanceOrToken } from './types';
import type { Injector } from '@angular/core';
import {
  Inject,
  Injectable,
  InjectFlags,
  INJECTOR,
} from '@angular/core';
import { BaseDefinitionMetadata } from './definition.metadata';
import { BaseDefinition } from './definition';
import { RxapDefinitionError } from './error';

@Injectable({ providedIn: 'root' })
export class DefinitionLoader {
  constructor(
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) {
  }

  public load<Definition extends BaseDefinition>(
    definitionIdOrInstanceOrInjectionToken: IdOrInstanceOrToken<Definition>,
    metadata?: Partial<BaseDefinitionMetadata>,
    injector: Injector = this.injector,
    notFoundValue?: Definition,
    flags?: InjectFlags,
  ): Definition {
    if (typeof definitionIdOrInstanceOrInjectionToken === 'string') {
      throw new RxapDefinitionError(
        'Creating a definition instance from the definition id is not supported by the DefinitionLoader service',
        '',
      );
    }

    if (definitionIdOrInstanceOrInjectionToken instanceof BaseDefinition) {
      if (metadata) {
        definitionIdOrInstanceOrInjectionToken.applyMetadata(metadata);
      }
      return definitionIdOrInstanceOrInjectionToken;
    }

    return injector.get<Definition>(
      definitionIdOrInstanceOrInjectionToken,
      notFoundValue,
      flags,
    );
  }
}
