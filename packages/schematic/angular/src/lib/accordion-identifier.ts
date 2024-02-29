import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';

/**
 * TODO : rename to `IdentifierOptions`
 * @deprecated rename to `IdentifierOptions`
 */
export interface AccordionIdentifier {
  property: DataProperty;
  source: string;
}

export interface NormalizedAccordionIdentifier {
  property: NormalizedDataProperty;
  source: string;
}

export function NormalizeAccordionIdentifier(identifier?: AccordionIdentifier): NormalizedAccordionIdentifier | null {
  if (!identifier || Object.keys(identifier).length === 0 || Object.keys(identifier.property).length === 0 || identifier.property.name === undefined) {
    return null;
  }
  return {
    property: NormalizeDataProperty(identifier.property),
    source: identifier.source,
  };
}
