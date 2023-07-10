import {
  DecoratorStructure,
  OptionalKind,
  PropertyDeclaration,
} from 'ts-morph';

export function OverwriteDecorator(
  controlProperty: PropertyDeclaration,
  structure: OptionalKind<DecoratorStructure>,
) {
  const decorator = controlProperty.getDecorator(structure.name);
  decorator?.remove();
  controlProperty.insertDecorator(0, structure);
}
