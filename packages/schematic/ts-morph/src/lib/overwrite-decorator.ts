import {
  DecoratorStructure,
  OptionalKind,
  PropertyDeclaration,
} from 'ts-morph';

/**
 * Overwrite the decorator of a control property.
 *
 * @param {PropertyDeclaration} controlProperty - The control property to overwrite the decorator for.
 * @param {OptionalKind<DecoratorStructure>} structure - The new decorator structure to use.
 * @return {void}
 */
export function OverwriteDecorator(
  controlProperty: PropertyDeclaration,
  structure: OptionalKind<DecoratorStructure>,
) {
  const decorator = controlProperty.getDecorator(structure.name);
  decorator?.remove();
  controlProperty.insertDecorator(0, structure);
}
