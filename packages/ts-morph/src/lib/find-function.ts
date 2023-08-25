export type FindFunction<Node> = (node: Node) => boolean;

export type FindFunctionFactory<CompareTo, Node> = (compareTo: CompareTo) => FindFunction<Node>;

export function FindByNameFunction<
  CompareTo extends { name: string },
  Node extends { getName(): string | undefined },
>(compareTo: CompareTo): (node: Node) => boolean {
  return node => node.getName() === compareTo.name;
}
