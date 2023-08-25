/**
 * @deprecated import from @rxap/ts-morph
 */
export type FindFunctionFactory<CompareTo, Node> = (compareTo: CompareTo) => (node: Node) => boolean;

/**
 * @deprecated import from @rxap/ts-morph
 */
export function FindByNameFunction<CompareTo extends { name: string }, Node extends {
  getName(): string
}>(compareTo: CompareTo): (node: Node) => boolean {
  return node => node.getName() === compareTo.name;
}
