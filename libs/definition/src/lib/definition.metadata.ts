import {
  Constructor,
  getMetadata,
  setMetadata
} from '@rxap/utilities';
import { BaseDefinition } from './definition';

export interface BaseDefinitionMetadata {
  id: string;

  [ key: string ]: any;
}

export enum DefinitionMetadataKeys {
  META_DATA    = 'rxap/definition/metadata',
  PACKAGE_NAME = 'rxap/definition/package-name',
  CLASS_NAME   = 'rxap/definition/class-name',
}

export function DefinitionMetadata(metadataOrId: BaseDefinitionMetadata | string, className: string, packageName: string) {
  return function(target: Constructor<BaseDefinition>) {
    setMetadata(DefinitionMetadataKeys.META_DATA, typeof metadataOrId === 'string' ? { id: metadataOrId } : metadataOrId, target);
    setMetadata(DefinitionMetadataKeys.PACKAGE_NAME, packageName, target);
    setMetadata(DefinitionMetadataKeys.CLASS_NAME, className, target);
  };
}

export function GetDefinitionMetadata<MetaData extends BaseDefinitionMetadata>(definition: Constructor<BaseDefinition> | BaseDefinition | Function): MetaData | null {
  if (typeof definition === 'function') {
    return getMetadata<MetaData>(DefinitionMetadataKeys.META_DATA, definition);
  } else {
    return getMetadata<MetaData>(DefinitionMetadataKeys.META_DATA, definition.constructor);
  }
}

export function GetDefinitionClassName(definition: Constructor<BaseDefinition> | BaseDefinition | Function): string | null {
  if (typeof definition === 'function') {
    return getMetadata<string>(DefinitionMetadataKeys.CLASS_NAME, definition);
  } else {
    return getMetadata<string>(DefinitionMetadataKeys.CLASS_NAME, definition.constructor);
  }
}

export function GetDefinitionPackageName(definition: Constructor<BaseDefinition> | BaseDefinition | Function): string | null {
  if (typeof definition === 'function') {
    return getMetadata<string>(DefinitionMetadataKeys.PACKAGE_NAME, definition);
  } else {
    return getMetadata<string>(DefinitionMetadataKeys.PACKAGE_NAME, definition.constructor);
  }
}
