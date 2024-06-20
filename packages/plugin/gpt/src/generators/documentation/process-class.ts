import { ClassDeclaration } from 'ts-morph';
import { processMethod } from './process-method';
import { DocumentationGeneratorSchema } from './schema';

export async function processClass(
  options: DocumentationGeneratorSchema,
  classDeclaration: ClassDeclaration,
) {

  console.log(`====== Process class: \x1b[36m${ classDeclaration.getName() }\x1b[0m`);

  for (const methodDefinition of classDeclaration.getMethods()) {
    await processMethod(options, methodDefinition);
  }

}
