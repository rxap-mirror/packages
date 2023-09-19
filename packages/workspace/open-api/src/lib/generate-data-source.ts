import { strings } from '@angular-devkit/core';
import { join } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  Writers,
} from 'ts-morph';
import {
  DATA_SOURCE_BASE_PATH,
  DATA_SOURCE_FILE_SUFFIX,
} from './const';
import { GenerateParameter } from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetResponseType } from './utilities/get-response-type';

const {
  dasherize,
  classify,
} = strings;

export function GenerateDataSource(
  parameter: GenerateParameter,
): void {
  if (parameter.method.toUpperCase() !== 'GET') {
    return;
  }

  const operationId = parameter.operationId;

  const name = [ operationId, DATA_SOURCE_FILE_SUFFIX ].join('.');
  const fileName = join(DATA_SOURCE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/data-source',
      namedImports: [
        { name: 'RxapOpenApiDataSource' },
        { name: 'OpenApiDataSource' },
      ],
    },
    {
      moduleSpecifier: '@angular/core',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

  const {
    type: responseType,
    name: responseName,
  } = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);

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

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name: classify(name.replace(/\./g, '-')),
    decorators: [
      {
        name: 'Injectable',
        arguments: Writers.object({
          providedIn: (writer) => writer.quote('root'),
        }),
      },
      {
        name: 'RxapOpenApiDataSource',
        arguments: (writer) => writer.quote(operationId),
      },
    ],
    extends: (writer) => {
      writer.write('OpenApiDataSource');
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write('>');
    },
    isExported: true,
  };

  sourceFile.addImportDeclarations(importStructures);
  sourceFile.addClass(classStructure);
}
