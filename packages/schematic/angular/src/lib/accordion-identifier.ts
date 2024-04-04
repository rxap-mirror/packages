import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  TypeImport,
  TypeName,
} from '@rxap/ts-morph';

/**
 * TODO : rename to `IdentifierOptions`
 * @deprecated rename to `IdentifierOptions`
 */
export interface AccordionIdentifier {
  property: DataProperty;
  source?: string;
}

export interface NormalizedAccordionIdentifier {
  property: NormalizedDataProperty;
  source: string | null;
}

export function NormalizeAccordionIdentifier(identifier?: AccordionIdentifier, defaultType: TypeImport | TypeName = 'unknown'): NormalizedAccordionIdentifier | null {
  if (!identifier || Object.keys(identifier).length === 0 || Object.keys(identifier.property).length === 0 || identifier.property.name === undefined) {
    return null;
  }
  return {
    property: NormalizeDataProperty(identifier.property, defaultType),
    source: identifier.source ?? null,
  };
}
