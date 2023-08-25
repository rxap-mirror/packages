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
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceDecorator(
  decoratableNode: DecoratableNode,
  name: string,
  structure?: Partial<Omit<OptionalKind<DecoratorStructure>, 'name'>>,
  compareTo?: FindFunctionFactory<Partial<DecoratorStructure>, Decorator>,
): Decorator;
/**
 * @deprecated Use the overload with the name parameter
 */
export function CoerceDecorator(
  decoratableNode: DecoratableNode,
  structure: Partial<OptionalKind<DecoratorStructure>> & { name: string },
): Decorator;
/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceDecorator(
  decoratableNode: DecoratableNode,
  structureOrName: OptionalKind<DecoratorStructure> | string,
  structure: Partial<Omit<DecoratorStructure, 'name'>> = {},
  compareTo: FindFunctionFactory<Partial<DecoratorStructure> & { name: string }, Decorator> = FindByNameFunction,
): Decorator {
  let name: string;
  if (typeof structureOrName === 'string') {
    name = structureOrName;
  } else {
    name = structureOrName.name;
    structure = structureOrName ?? structure;
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
