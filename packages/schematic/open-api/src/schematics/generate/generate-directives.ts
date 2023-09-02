import { dasherize } from '@rxap/utilities';
import { join } from 'path';
import {
  ImportDeclarationStructure,
  OptionalKind,
} from 'ts-morph';
import { GenerateParameter } from '../../lib/types';
import { GetParameterType } from '../../lib/utilities/get-parameter-type';
import { GetRequestBodyType } from '../../lib/utilities/get-request-body-type';
import { GetResponseType } from '../../lib/utilities/get-response-type';
import { IsCollectionResponse } from '../../lib/utilities/is-collection-response';
import { IsWithoutParameters } from '../../lib/utilities/is-without-parameters';
import {
  DIRECTIVE_BASE_PATH,
  DIRECTIVE_FILE_SUFFIX,
} from './const';
import { CreateDirective } from './create-directive';
import { OpenApiSchemaBase } from './schema';

export function GenerateDirectives(parameter: GenerateParameter<OpenApiSchemaBase>): void {
  const operationId = parameter.operationId;

  const name = [ operationId, DIRECTIVE_FILE_SUFFIX ].join('.');
  const fileName = join(DIRECTIVE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/remote-method',
      namedImports: [
        { name: 'RxapOpenApiRemoteMethod' }, { name: 'OpenApiRemoteMethodParameter' },
      ],
    }, {
      moduleSpecifier: '@angular/core',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

  switch (parameter.options.transport) {
    case 'amplify':
      importStructures.push({
        moduleSpecifier: '@rxap/amplify-open-api',
        namedImports: [ { name: 'AmplifyOpenApiRemoteMethod' } ],
      });
      break;

    default:
      importStructures.push({
        moduleSpecifier: '@rxap/open-api/remote-method',
        namedImports: [ { name: 'OpenApiRemoteMethod' } ],
      });
      break;
  }

  const responseType: string = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const requestBodyType: string = GetRequestBodyType(parameter);

  if (![ 'void', 'any' ].includes(responseType)) {
    importStructures.push({
      moduleSpecifier: `../responses/${ dasherize(responseType.replace(/Response$/, '')) }.response`,
      namedImports: [ { name: responseType } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: `../parameters/${ dasherize(parameterType.replace(/Parameter$/, '')) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (![ 'void', 'any' ].includes(requestBodyType)) {
    importStructures.push({
      moduleSpecifier: `../request-bodies/${ dasherize(requestBodyType.replace(/RequestBody$/, '')) }.request-body`,
      namedImports: [ { name: requestBodyType } ],
    });
  }

  const withoutParameters = IsWithoutParameters(parameter);

  if (IsCollectionResponse(parameter)) {
    importStructures.push({
      moduleSpecifier: '@rxap/utilities',
      namedImports: [ { name: 'ArrayElement' } ],
    });
    CreateDirective({
      filePath: fileName,
      name: operationId,
      prefix: parameter.options.prefix,
      parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
      returnType: `ArrayElement<${ responseType }>`,
      template: true,
      collection: true,
      sourceFile,
      withoutParameters,
    });
  }

  CreateDirective({
    filePath: fileName,
    name: operationId,
    prefix: parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
    returnType: responseType,
    template: true,
    collection: false,
    sourceFile,
    withoutParameters,
  });

  CreateDirective({
    filePath: fileName,
    name: operationId,
    prefix: parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
    returnType: responseType,
    template: false,
    collection: false,
    sourceFile,
    withoutParameters,
  });

  sourceFile.addImportDeclarations(importStructures);

  sourceFile.organizeImports({
    ensureNewLineAtEndOfFile: true,
  });

}
