import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { DocumentationGeneratorSchema } from './schema';

async function processClass(
  options: DocumentationGeneratorSchema,
  project: Project,
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
) {

  console.log(`====== Process class: \x1b[36m${ classDeclaration.getName() }\x1b[0m`);

  let changed = false;

  for (const md of classDeclaration.getMethods()) {
    const scope = md.getScope();
    if (scope === 'public' || scope === undefined) {
      const hasChanged = await processMethod(options, project, sourceFile, md);
      changed = changed || hasChanged;
    }
  }

  return changed;

}
