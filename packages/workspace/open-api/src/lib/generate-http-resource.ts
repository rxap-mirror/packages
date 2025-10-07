import { camelize, dasherize } from '@rxap/utilities';
import {
  GenerateParameter,
  GetParameterType,
  GetRequestBodyType,
  GetResponseType,
  GetTypeParameters,
  IsRefSchemaObject,
  OpenApiSchemaBase,
} from '@rxap/workspace-open-api';
import { join } from 'path';
import {
  FunctionDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  TypeParameterDeclarationStructure,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { HTTP_RESOURCE_BASE_PATH, HTTP_RESOURCE_FILE_SUFFIX } from './const';
import { hasResponseAdditionalProperties } from './utilities/has-response-additional-properties';

export function GenerateHttpResource(
  parameter: GenerateParameter<OpenApiSchemaBase>
): void {
  if (parameter.method.toUpperCase() !== 'GET') {
    return;
  }

  const operationId = parameter.operationId;

  const name = [operationId, HTTP_RESOURCE_FILE_SUFFIX].join('.');
  const fileName = join(HTTP_RESOURCE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/http-resource',
      namedImports: [
        { name: 'OPEN_API_OPERATION_ID' },
        { name: 'OPEN_API_SERVER_ID' },
        { name: 'SignalProperties' },
        { name: 'toHttpParams' },
      ],
    },
    {
      moduleSpecifier: '@angular/common/http',
      namedImports: [{ name: 'HttpResourceRef' }, { name: 'HttpContext' }, { name: 'httpResource' }, { name: 'HttpResourceOptions' }],
    },
  ];

  const { type: responseType, name: responseName } = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const { type: requestBodyType, name: requestBodyName } =
    GetRequestBodyType(parameter);

  if (responseName) {
    importStructures.push({
      moduleSpecifier:
        parameter.options.packageName ??
        `../responses/${dasherize(
          responseName.replace(/Response$/, '')
        )}.response`,
      namedImports: [{ name: responseName }],
    });
  }

  if (!['void', 'any'].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier:
        parameter.options.packageName ??
        `../parameters/${dasherize(
          parameterType.replace(/Parameter$/, '')
        )}.parameter`,
      namedImports: [{ name: parameterType }],
    });
  }

  if (requestBodyName) {
    importStructures.push({
      moduleSpecifier:
        parameter.options.packageName ??
        `../request-bodies/${dasherize(
          requestBodyName.replace(/RequestBody$/, '')
        )}.request-body`,
      namedImports: [{ name: requestBodyName }],
    });
  }

  const withoutParameters = parameterType === 'void';
  const withoutRequestBody = requestBodyType === 'void';
  const withoutParametersAndRequestBody =
    withoutParameters && withoutRequestBody;

  const httpOptions: Record<string, string | WriterFunction> = {};

  if (
    parameter.parameters?.some((p) => !IsRefSchemaObject(p) && p.in === 'path')
  ) {
    httpOptions['url'] = (w) => {
      w.write('`');
      w.write(
        parameter.path.replace(
          /\{([^}]+)\}/g,
          (_, name) => {
            const isArray = !!parameter.parameters?.find(p => !IsRefSchemaObject(p) && p.name === name && p.in === 'path' && p.schema && typeof p.schema === 'object' && 'type' in p.schema && p.schema.type === 'array');
            if (isArray) {
              return `\${parameters.${ name }().map(v => encodeURIComponent(v)).join('/)}`;
            }
            return `\${encodeURIComponent(parameters.${ name }())}`;
          }
        )
      );
      w.write('`');
    };
  } else {
    httpOptions['url'] = (w) => w.quote(parameter.path);
  }

  httpOptions['method'] = (w) => w.quote(parameter.method.toUpperCase());
  if (!withoutParameters) {
    httpOptions['params'] = `toHttpParams(parameters, [${parameter.parameters!
      .filter((p) => !IsRefSchemaObject(p) && p.in === 'query')
      .map((p: any) => `'${p.name}'`)
      .join(', ')}])`;
  }
  if (!withoutRequestBody) {
    httpOptions['body'] = 'requestBody()';
  }

  httpOptions[
    'context'
    ] = `new HttpContext().set(OPEN_API_OPERATION_ID, '${parameter.operationId}').set(OPEN_API_SERVER_ID, '${parameter.options.serverId}')`;
  httpOptions['withCredentials'] = 'true';

  const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];

  if (!withoutParametersAndRequestBody) {
    if (!withoutRequestBody) {
      parameters.push({
        name: 'requestBody',
        type: `Signal<${requestBodyType}>`,
      });
    }
    if (!withoutParameters) {
      parameters.push({
        name: 'parameters',
        type: `SignalProperties<${parameterType}>`,
        initializer: parameter.parameters?.some(
          (p) => !IsRefSchemaObject(p) && p.required
        )
                     ? undefined
                     : '{}',
      });
    }
  }

  const optionsParameter = {
    name: 'options',
    type: `HttpResourceOptions<${responseType}, unknown>`,
    hasQuestionToken: true,
  };
  const optionsParameterNoInfer = {
    name: 'options',
    type: `HttpResourceOptions<${responseType}, unknown> & { defaultValue: NoInfer<${responseType}> }`,
  };

  const typeParameters: (OptionalKind<TypeParameterDeclarationStructure> | string)[] = GetTypeParameters(parameter);

  const structure: OptionalKind<FunctionDeclarationStructure> = {
    isExported: true,
    name: camelize([parameter.operationId, 'http-resource'].join('_')),
    parameters: [ ...parameters, optionsParameter ],
    statements: [
      `return httpResource<${responseType}>(`,
      (w) => {
        w.write('() => (');
        Writers.object(httpOptions)(w);
        w.write('),');
        w.writeLine('options');
      },
      `);`,
    ],
    returnType: `HttpResourceRef<${responseType} | undefined>`,
    overloads: [
      {
        parameters: [ ...parameters.map(p => ({ ...p, initializer: undefined })), optionsParameterNoInfer ],
        returnType: `HttpResourceRef<${responseType}>`,
        typeParameters,
      },
      {
        parameters: [ ...parameters.map(p => ({ ...p, initializer: undefined, hasQuestionToken: !!p.initializer })), optionsParameter ],
        returnType: `HttpResourceRef<${responseType} | undefined>`,
        typeParameters,
      }
    ],
    typeParameters,
  };

  sourceFile.addFunction(structure);

  sourceFile.addImportDeclarations(importStructures);

  sourceFile.organizeImports({
    ensureNewLineAtEndOfFile: true,
  });
}
