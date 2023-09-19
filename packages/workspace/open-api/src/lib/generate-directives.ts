import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ImportDeclarationStructure,
  OptionalKind,
} from 'ts-morph';
import {
  DIRECTIVE_BASE_PATH,
  DIRECTIVE_FILE_SUFFIX,
  REMOTE_METHOD_FILE_SUFFIX,
} from './const';
import { CreateDirective } from './create-directive';
import {
  GenerateParameter,
  OpenApiSchemaBase,
} from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetRequestBodyType } from './utilities/get-request-body-type';
import { GetResponseType } from './utilities/get-response-type';
import { IsCollectionResponse } from './utilities/is-collection-response';
import { IsWithoutParameters } from './utilities/is-without-parameters';

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
    {
      moduleSpecifier: `../remote-methods/${ dasherize(operationId) }.${ REMOTE_METHOD_FILE_SUFFIX }`,
      namedImports: [ classify([ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('-')) ],
    },
  ];

  importStructures.push({
    moduleSpecifier: '@rxap/open-api/remote-method',
    namedImports: [ { name: 'OpenApiRemoteMethod' } ],
  });

  const {
    type: responseType,
    name: responseName,
  } = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const {
    type: requestBodyType,
    name: requestBodyName,
  } = GetRequestBodyType(parameter);

  if (responseName) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../responses/${ dasherize(responseName.replace(/Response$/, '')) }.response`,
      namedImports: [ { name: responseName } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../parameters/${ dasherize(parameterType.replace(/Parameter$/, '')) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (requestBodyName) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../request-bodies/${ dasherize(requestBodyName.replace(/RequestBody$/, '')) }.request-body`,
      namedImports: [ { name: requestBodyName } ],
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
