export type FindFunction<Node> = (node: Node) => boolean;

export type FindFunctionFactory<CompareTo, Node> = (compareTo: CompareTo) => FindFunction<Node>;

/**
 * Factory function to create a find function that searches by name.
 *
 * @param compareTo - Object containing the name to compare against.
 * @returns A function that returns true if the node's name matches.
 */
export function FindByNameFunction<
  CompareTo extends { name: string },
  Node extends { getName(): string | undefined },
>(compareTo: CompareTo): (node: Node) => boolean {
  return node => node.getName()?.trim() === compareTo.name;
}
