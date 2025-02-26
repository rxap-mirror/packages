// rxap-no-index-export
import {
  getProjects,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceFile,
  GetProjectRoot,
  GetProjectSourceRoot,
  SearchFile,
  SkipNonLibraryProject,
  VisitTree,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
} from 'path';
import { IndexExportGeneratorSchema } from './schema';

function generateIndexFile(tree: Tree, sourceRoot: string, libRootFolder = 'lib') {

  const libRoot = join(sourceRoot, libRootFolder);

  let filePathList: string[] = [];

  for (const {
    path,
    isFile
  } of VisitTree(tree, libRoot)) {
    if (isFile &&
      path.endsWith('.ts') &&
      !path.endsWith('.spec.ts') &&
      !path.endsWith('.cy.ts') &&
      !path.endsWith('.stories.ts') &&
      !path.endsWith('.d.ts')) {
      const content = tree.read(path)?.toString('utf-8');
      if (content?.match(/^export /gm)) {
        filePathList.push(path);
      }
    }
  }

  filePathList = filePathList.filter(path => {
    const content = tree.read(path)?.toString('utf-8');
    return content && !content.split('\n').some(line => line.match(/rxap-no-index-export/));
  });

  filePathList = filePathList.map(path => path.replace(new RegExp(`^${ libRoot }/`), ''));

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
      rootIndexFile += `export * from './${ join(libRootFolder, basePath) }/index';\n`;
    } else {
      for (const fileName of map.get(basePath)!) {
        const fullPathToLibRoot = join(libRootFolder, basePath, fileName);
        const importPath =  fullPathToLibRoot.replace(/\.ts$/, '');
        if (importPath === 'index') {
          continue;
        }
        rootIndexFile += `export * from './${importPath}';\n`;
      }
    }

    rootIndexFile += `// endregion\n`;
  }

  if (!rootIndexFile) {
    rootIndexFile = 'export {};';
  }


  CoerceFile(tree, join(sourceRoot, 'index.ts'), rootIndexFile, true);

}

function skipProject(tree: Tree, options: IndexExportGeneratorSchema, project: any, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;
}

export async function indexExportGenerator(tree: Tree, options: IndexExportGeneratorSchema) {
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('index export generator: ', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {
    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log('generate index file for project: ', projectName);
    for (const { path } of SearchFile(tree, GetProjectRoot(tree, projectName))) {
      if (path.endsWith('ng-package.json')) {
        generateIndexFile(tree, join(dirname(path), 'src'));
      }
    }

    const additionalEntryPoints = (options.additionalEntryPoints ?? []).concat(project.targets?.build?.options?.additionalEntryPoints ?? []);
    for (const entryPoint of additionalEntryPoints) {
      if (entryPoint.endsWith('index.ts')) {
        generateIndexFile(tree, dirname(entryPoint), '');
      }
    }

    const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

    if (!projectSourceRoot) {
      console.warn(`no source root found for project: ${ projectName }`);
      continue;
    }

    if (options.generateRootExport) {
      generateIndexFile(tree, projectSourceRoot);
    }

  }

}

export default indexExportGenerator;
