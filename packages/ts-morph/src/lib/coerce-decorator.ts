import {
  DecoratableNode,
  Decorator,
  DecoratorStructure,
  OptionalKind,
} from 'ts-morph';
import {
  FindByNameFunction,
  FindFunctionFactory,
} from './find-function';

export function CoerceDecorator(
  decoratableNode: DecoratableNode,
  name: string,
  structure: Partial<Omit<OptionalKind<DecoratorStructure>, 'name'>> = {},
  compareTo: FindFunctionFactory<Partial<DecoratorStructure> & { name: string }, Decorator> = FindByNameFunction,
): Decorator {
  const match = name.match(/(.+)<(.+)>/);
  if (match) {
    name = match[1];
    structure.typeArguments = match[2].split(',');
  }
  let decorator = decoratableNode.getDecorator(compareTo({
    ...structure,
    name,
  }));
  if (!decorator) {
    decorator = decoratableNode.addDecorator({ name });
    decorator.set(structure);
  }
  return decorator;
}
