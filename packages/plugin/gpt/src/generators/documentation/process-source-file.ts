import {
  Project,
  SourceFile,
} from 'ts-morph';
import { processFunction } from './process-function';
import { DocumentationGeneratorSchema } from './schema';

export async function processSourceFile(
  options: DocumentationGeneratorSchema, project: Project, sourceFile: SourceFile) {

  console.log(`====== Process source file: \x1b[35m${ sourceFile.getFilePath() }\x1b[0m`);

  let changed = false;

  for (const fd of sourceFile.getFunctions()) {
    const hasChanged = await processFunction(options, project, sourceFile, fd);
    changed = changed || hasChanged;
  }

  // for (const cd of sourceFile.getClasses()) {
  //   const hasChanged = await processClass(options, project, sourceFile, cd);
  //   changed = changed || hasChanged;
  // }

  return changed;

}
