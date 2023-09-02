import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  Writers,
} from 'ts-morph';
import {
  COMMAND_BASE_PATH,
  COMMAND_FILE_SUFFIX,
} from './const';
import {
  GenerateParameter,
  GenerateParameterToOperationObjectWithMetadata,
  OpenApiSchemaBase,
} from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetRequestBodyType } from './utilities/get-request-body-type';
import { GetResponseType } from './utilities/get-response-type';

export async function GenerateOperationCommand(
  parameter: GenerateParameter<OpenApiSchemaBase>,
): Promise<void> {
  const operationId = parameter.operationId;

  const name = [ operationId, COMMAND_FILE_SUFFIX ].join('.');

  const fileName = join(COMMAND_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [
        { name: 'OpenApiOperationCommand' },
        { name: 'OperationCommand' },
      ],
    },
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

  const responseType: string = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const requestBodyType: string = GetRequestBodyType(parameter);

  if (![ 'void', 'any' ].includes(responseType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ?? `../responses/${ dasherize(
        responseType.replace(/Response$/, ''),
      ) }.response`,
      namedImports: [ { name: responseType } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ?? `../parameters/${ dasherize(
        parameterType.replace(/Parameter$/, ''),
      ) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (![ 'void', 'any' ].includes(requestBodyType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ?? `../request-bodies/${ dasherize(
        requestBodyType.replace(/RequestBody$/, ''),
      ) }.request-body`,
      namedImports: [ { name: requestBodyType } ],
    });
  }

  const callMethodParameters: OptionalKind<ParameterDeclarationStructure>[] =
    [];

  const withoutParametersAndRequestBody =
    parameterType === 'void' && requestBodyType === 'void';

  if (!withoutParametersAndRequestBody) {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiOperationCommandParameters<${ parameterType }, ${ requestBodyType }>`,
    });
    importStructures.push({
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [ { name: 'OpenApiOperationCommandParameters' } ],
    });
  } else {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiOperationCommandWithoutParameters`,
      initializer: '{}',
    });
    importStructures.push({
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [ { name: 'OpenApiOperationCommandWithoutParameters' } ],
    });
  }

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name: classify(name.replace(/\./g, '-')),
    decorators: [
      {
        name: 'Injectable',
        arguments: [],
      },
      {
        name: 'OperationCommand',
        arguments: (writer) =>
          Writers.object({
            serverId: (w) => w.quote(parameter.options.serverId!),
            operationId: (w) => w.quote(parameter.operationId),
            operation: (w) =>
              w.quote(
                JSON.stringify(
                  GenerateParameterToOperationObjectWithMetadata(parameter),
                ).replace(/[\n\r\\]+/g, ''),
              ),
          })(writer),
      },
    ],
    methods: [
      {
        name: 'execute',
        parameters: callMethodParameters,
        scope: Scope.Public,
        returnType: `Promise<${ responseType }>`,
        hasOverrideKeyword: true,
        statements: [ `return super.execute(parameters);` ],
      },
    ],
    extends: (writer) => {
      writer.write('OpenApiOperationCommand');
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write(', ');
      writer.write(requestBodyType);
      writer.write('>');
    },
    isExported: true,
  };

  sourceFile.addClass(classStructure);

  sourceFile.addImportDeclarations(importStructures);
}
