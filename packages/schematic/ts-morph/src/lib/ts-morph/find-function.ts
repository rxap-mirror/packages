export type FindFunctionFactory<CompareTo, Node> = (compareTo: CompareTo) => (node: Node) => boolean;

export function FindByNameFunction<CompareTo extends { name: string }, Node extends {
  getName(): string
}>(compareTo: CompareTo): (node: Node) => boolean {
  return node => node.getName() === compareTo.name;
}
