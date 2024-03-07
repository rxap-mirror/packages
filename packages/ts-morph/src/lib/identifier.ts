import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from './data-property';

export interface IdentifierOptions {
  property: DataProperty;
  source?: string;
}

export interface NormalizedIdentifierOptions {
  property: NormalizedDataProperty;
  source: string | null;
}

export function NormalizeAccordionIdentifier(identifier?: IdentifierOptions): NormalizedIdentifierOptions | null {
  if (!identifier || Object.keys(identifier).length === 0 || Object.keys(identifier.property).length === 0 || identifier.property.name === undefined) {
    return null;
  }
  return {
    property: NormalizeDataProperty(identifier.property),
    source: identifier.source ?? null,
  };
}
