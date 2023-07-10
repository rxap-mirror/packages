import { Tree } from '@nx/devkit';
import { IndexExportGeneratorSchema } from './schema';
import {
  CoerceFile,
  GetProjectSourceRoot,
  VisitTree,
} from '@rxap/generator-utilities';
import { join } from 'path';

export async function indexExportGenerator(tree: Tree, options: IndexExportGeneratorSchema) {

  const sourceRoot = GetProjectSourceRoot(tree, options.project);

  const libRoot = join(sourceRoot, 'lib');

  let filePathList: string[] = [];

  for (const { path, isFile } of VisitTree(tree, libRoot)) {
    if (isFile &&
        path.endsWith('.ts') &&
        !path.endsWith('.spec.ts') &&
        !path.endsWith('.stories.ts') &&
        !path.endsWith('.d.ts')) {
      filePathList.push(path);
    }
  }

  filePathList = filePathList.map(path => path.replace(new RegExp(`^${libRoot}/`), ''));

  const map = new Map<string, string[]>();

  for (const filePath of filePathList) {
    const fragments = filePath.split('/');
    const fileName = fragments.pop()!;
    const basePath = fragments.join('/');
    if (!map.has(basePath)) {
      map.set(basePath, []);
    }
    map.get(basePath)!.push(fileName);
  }

  let rootIndexFile = '';

  for (const basePath of Array.from(map.keys()).sort().reverse()) {

    rootIndexFile += `${ rootIndexFile ? '\n' : '' }// region ${ basePath.split('/').join(' ') }\n`;

    if (map.has('index.ts')) {
      console.log('skip folder with index.ts file', basePath);
      rootIndexFile += `export * from './lib/${ basePath }/index';\n`;
    } else {
      for (const fileName of map.get(basePath)!) {
        const fullPathToLibRoot = join('lib', basePath, fileName);
        rootIndexFile += `export * from './${ fullPathToLibRoot.replace(/\.ts$/, '') }';\n`;
      }
    }

    rootIndexFile += `// endregion\n`;
  }


  CoerceFile(tree, join(sourceRoot, 'index.ts'), rootIndexFile, true);

}

export default indexExportGenerator;
