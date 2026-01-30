import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from './data-property';

export interface IdentifierOptions {
  /**
   * The property definition used as the identifier.
   */
  property: DataProperty;
  /**
   * The source of the identifier (e.g. database column name).
   */
  source?: string;
}

export interface NormalizedIdentifierOptions {
  property: NormalizedDataProperty;
  source: string | null;
}

/**
 * Normalizes identifier options for accordion or similar components.
 *
 * @param identifier - The identifier options to normalize.
 * @returns The normalized identifier options or null.
 */
export function NormalizeAccordionIdentifier(identifier?: IdentifierOptions): NormalizedIdentifierOptions | null {
  if (!identifier || Object.keys(identifier).length === 0 || Object.keys(identifier.property).length === 0 || identifier.property.name === undefined) {
    return null;
  }
  return {
    property: NormalizeDataProperty(identifier.property),
    source: identifier.source ?? null,
  };
}
