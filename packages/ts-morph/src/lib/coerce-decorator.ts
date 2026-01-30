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

/**
 * Coerces a decorator on a node.
 * If the decorator exists, it returns it. Otherwise, it adds it.
 *
 * @param decoratableNode - The node to add the decorator to.
 * @param name - The name of the decorator.
 * @param structure - Optional structure to apply to the decorator.
 * @param compareTo - A function factory to determine if the decorator already exists. Defaults to comparing by name.
 * @returns The existing or added decorator.
 */
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
