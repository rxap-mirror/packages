import { Tree } from "@nx/devkit";

export function CoerceIgnorePattern(tree: Tree, filePath: string, patternList: string[]) {

  if (!tree.exists(filePath)) {
    tree.write(filePath, "");
  }

  if (!tree.isFile(filePath)) {
    throw new Error(`The path: ${ filePath } is not a file`);
  }

  let content = tree.read(filePath)!.toString("utf-8");

  for (const pattern of patternList) {
    if (!content.includes(pattern)) {
      content += `\n${ pattern }`;
    }
  }

  tree.write(filePath, content);

}
