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

export async function processMethod(
  options: DocumentationGeneratorSchema,
  methodDeclaration: MethodDeclaration,
) {

  console.log(`====== Process method: \x1b[36m${ methodDeclaration.getName() }\x1b[0m`);

  if (hasJsDoc(methodDeclaration)) {
    console.log(`\x1b[33mMethod has already a documentation\x1b[0m`);
    return;
  }

  const methodText = methodDeclaration.getText();

  try {
    const jsDoc = await prompt(
      options,
      METHOD_SYSTEM_PROMPT,
      methodText,
    );

    addJsDoc(options, methodDeclaration, jsDoc);
  } catch (e: any) {
    console.error(`\x1b[31mError processing method: \x1b[0m${ methodDeclaration.getName() }`);
    console.error(e.message);
    console.error(e.stack);
    return;
  }

}
