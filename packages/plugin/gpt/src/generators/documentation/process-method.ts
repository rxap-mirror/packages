import {
  MethodDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { addJsDoc } from './add-js-doc';
import { METHOD_SYSTEM_PROMPT } from './const';
import { hasJsDoc } from './has-js-doc';
import { prompt } from './prompt';
import { DocumentationGeneratorSchema } from './schema';

async function processMethod(
  options: DocumentationGeneratorSchema,
  project: Project,
  sourceFile: SourceFile,
  methodDeclaration: MethodDeclaration,
) {

  console.log(`====== Process method: \x1b[36m${ methodDeclaration.getName() }\x1b[0m`);

  if (hasJsDoc(methodDeclaration)) {
    console.log(`\x1b[33mMethod has already a documentation\x1b[0m`);
    return false;
  }

  const methodText = methodDeclaration.getText();

  console.log('Method text:');
  console.log(methodText);


  const jsDoc = await prompt(
    options,
    METHOD_SYSTEM_PROMPT,
    methodText,
  );

  console.log('Method documentation:');
  console.log(jsDoc);

  addJsDoc(options, methodDeclaration, jsDoc);

  return true;

}
