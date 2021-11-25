import {
  Project,
  VariableDeclarationKind
} from 'ts-morph';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import {
  REMOTE_METHOD_BASE_PATH,
  REMOTE_METHOD_FILE_SUFFIX
} from './const';

const { dasherize, classify } = strings;

export function GenerateOpenapiProvider(
  project: Project,
  operatorIdList: string[],
) {

  const sourceFile = project.createSourceFile('open-api-providers.ts');

  const providerList: string[] = [];

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@angular/core',
    namedImports: [ 'Provider' ]
  });

  for (const operationId of operatorIdList) {

    const name     = [ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('.');
    const moduleSpecifier = './' + join(REMOTE_METHOD_BASE_PATH, dasherize(name));
    const className = classify(name.replace(/\./g, '-'));

    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: [ className ]
    });

    providerList.push(className);

  }

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'OPEN_API_PROVIDERS',
        type: 'Provider[]',
        initializer: `[${providerList.join(', ')}]`,
      }
    ]
  });

}
