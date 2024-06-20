import { Tree } from '@nx/devkit';
import { AddDir } from '@rxap/generator-ts-morph';
import { CreateProject } from '@rxap/ts-morph';
import {
  CoerceFile,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { MAX_TIME } from './const';
import { processSourceFile } from './process-source-file';
import { DocumentationGeneratorSchema } from './schema';
import { skipSourceFile } from './skip-source-file';

export async function processProject(options: DocumentationGeneratorSchema, projectName: string, tree: Tree) {

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  const project = CreateProject();

  AddDir(tree, projectSourceRoot, project);

  const start = Date.now();

  for (const sourceFile of project.getSourceFiles()) {
    if (skipSourceFile(sourceFile, options.filter)) {
      continue;
    }
    try {
      const changed = await processSourceFile(options, project, sourceFile);
      if (changed) {
        CoerceFile(tree, join(projectSourceRoot, sourceFile.getFilePath()), sourceFile.getFullText(), true);
      }
    } catch (e: any) {
      console.error(`\x1b[31mError processing file: \x1b[0m${ sourceFile.getFilePath() }`);
      console.error(e.message);
      console.error(e.stack);
      break;
    }
    if (Date.now() - start > MAX_TIME) {
      console.log(`\x1b[33mMax time reached: \x1b[0m${ MAX_TIME }`);
      break;
    }
  }

}
