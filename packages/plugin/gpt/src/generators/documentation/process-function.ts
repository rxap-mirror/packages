import {
  FunctionDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { addJsDoc } from './add-js-doc';
import { FUNCTION_SYSTEM_PROMPT } from './const';
import { hasJsDoc } from './has-js-doc';
import { prompt } from './prompt';
import { DocumentationGeneratorSchema } from './schema';

export async function processFunction(
  options: DocumentationGeneratorSchema,
  functionDeclaration: FunctionDeclaration,
) {

  console.log(`====== Process function: \x1b[36m${ functionDeclaration.getName() }\x1b[0m`);

  if (hasJsDoc(functionDeclaration)) {
    console.log(`\x1b[33mFunction has already a documentation\x1b[0m`);
    return;
  }

  const functionText = functionDeclaration.getText();

  try {
    const jsDoc = await prompt(
      options,
      FUNCTION_SYSTEM_PROMPT,
      functionText,
    );
    addJsDoc(options, functionDeclaration, jsDoc);
  } catch (e: any) {
    console.error(`\x1b[31mError processing function: \x1b[0m${ functionDeclaration.getName() }`);
    console.error(e.message);
    console.error(e.stack);
    return;
  }

}
