import {
  Project,
  SourceFile,
} from 'ts-morph';
import { processClass } from './process-class';
import { processFunction } from './process-function';
import { DocumentationGeneratorSchema } from './schema';

export async function processSourceFile(
  options: DocumentationGeneratorSchema,
  sourceFile: SourceFile
) {

  console.log(`====== Process source file: \x1b[35m${ sourceFile.getFilePath() }\x1b[0m`);

  for (const functionDeclaration of sourceFile.getFunctions()) {
    await processFunction(options, functionDeclaration);
  }

  for (const classDeclaration of sourceFile.getClasses()) {
    await processClass(options, classDeclaration);
  }


}
