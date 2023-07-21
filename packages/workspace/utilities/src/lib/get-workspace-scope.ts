import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import {
  IsGeneratorTreeLike,
  IsJsonObject,
  IsSchematicTreeLike,
  JsonValue,
  TreeAdapter,
  TreeLike,
} from './tree';

export function GetWorkspaceScope(tree?: TreeLike) {
  let rootPackageJson: JsonValue;
  let root: string;

  if (tree) {
    if (IsSchematicTreeLike(tree)) {
      root = tree.root.path;
    } else if (IsGeneratorTreeLike(tree)) {
      root = tree.root;
    } else {
      throw new Error('The tree is not a valid schematic or generator tree');
    }
  } else {
    root = process.cwd();
  }
  const rootPackageJsonFile = join(root, 'package.json');
  if (tree) {
    if (!tree.exists(rootPackageJsonFile)) {
      throw new Error(`Could not find the root package.json file in '${ root }'`);
    }
    const wrappedTree = new TreeAdapter(tree);
    rootPackageJson = wrappedTree.readJson(rootPackageJsonFile);
  } else {
    if (!existsSync(rootPackageJsonFile)) {
      throw new Error(`Could not find the root package.json file in '${ root }'`);
    }
    rootPackageJson = JSON.parse(readFileSync(rootPackageJsonFile, 'utf-8'));
  }

  if (!IsJsonObject(rootPackageJson)) {
    throw new Error('The root package.json file is not a valid JSON object');
  }

  const name = rootPackageJson['name'];

  if (typeof name !== 'string') {
    throw new Error('The root package.json file does not contain a name property');
  }

  if (name.startsWith('@')) {
    return name;
  }

  return `@${ name }`;

}
