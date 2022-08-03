import {
  GenerateParameter,
  GetResponseType,
  GetParameterType
} from '@rxap/schematics-open-api';
import { join } from 'path';
import {
  OptionalKind,
  ImportDeclarationStructure,
  ClassDeclarationStructure,
  Writers
} from 'ts-morph';
import {
  DATA_SOURCE_FILE_SUFFIX,
  DATA_SOURCE_BASE_PATH
} from './const';
import { strings } from '@angular-devkit/core';

const { dasherize, classify } = strings;

export async function GenerateDataSource(
  parameter: GenerateParameter
): Promise<void> {
  if (parameter.method.toUpperCase() !== 'GET') {
    return;
  }

  const operationId = parameter.operationId;

  const name     = [ operationId, DATA_SOURCE_FILE_SUFFIX ].join('.');
  const fileName = join(DATA_SOURCE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/data-source',
      namedImports:    [
        { name: 'RxapOpenApiDataSource' },
        { name: 'OpenApiDataSource' }
      ]
    },
    {
      moduleSpecifier: '@angular/core',
      namedImports:    [ { name: 'Injectable' } ]
    }
  ];

  const responseType: string  = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);

  if (!['void', 'any'].includes(responseType)) {
    importStructures.push({
      moduleSpecifier: `../responses/${dasherize(responseType.replace(/Response$/, ''))}.response`,
      namedImports:    [ { name: responseType } ]
    })
  }

  if (!['void', 'any'].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: `../parameters/${dasherize(responseType.replace(/Parameter$/, ''))}.parameter`,
      namedImports:    [ { name: parameterType } ]
    })
  }

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name:       classify(name.replace(/\./g, '-')),
    decorators: [
      {
        name:      'Injectable',
        arguments: Writers.object({
          providedIn: (writer) => writer.quote('root')
        })
      },
      {
        name:      'RxapOpenApiDataSource',
        arguments: (writer) => writer.quote(operationId)
      }
    ],
    extends:    (writer) => {
      writer.write('OpenApiDataSource');
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write('>');
    },
    isExported: true
  };

  sourceFile.addImportDeclarations(importStructures);
  sourceFile.addClass(classStructure);
}
