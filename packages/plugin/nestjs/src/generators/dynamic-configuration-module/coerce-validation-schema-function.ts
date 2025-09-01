import {
  CoerceFunction,
  CoerceImports,
  CoerceSourceFile,
} from '@rxap/ts-morph';
import {
  camelize,
  dasherize,
  underscore,
} from '@rxap/utilities';
import { Project } from 'ts-morph';

export function coerceValidationSchemaFunction(project: Project, moduleName: string) {
  const name = moduleName.replace('Module', '') + 'ValidationSchema';
  const fileName = dasherize(name) + '.ts';
  const functionName = camelize(name);
  const sourceFile = CoerceSourceFile(project, fileName);
  CoerceImports(sourceFile, [
    {
      namedImports: ['Environment'],
      moduleSpecifier: '@rxap/nest-utilities'
    },
    {
      namedImports: ['SchemaMap'],
      moduleSpecifier: 'joi'
    },
    {
      namespaceImport: 'Joi',
      moduleSpecifier: 'joi'
    },
    {
      namedImports: [moduleName + 'Options'],
      moduleSpecifier: `./${dasherize(moduleName)}-options`,
    },
  ]);
  CoerceFunction(sourceFile, functionName, {
    parameters: [
      {
        name: 'environment',
        type: 'Environment',
      },
      {
        name: 'defaults',
        type: `Partial<Pick<${moduleName}Options, 'disabled'>>`,
        initializer: '{}'
      }
    ],
    isExported: true,
    statements: [
      'const schema: SchemaMap = {};',
      `schema['${underscore(moduleName.replace('Module', '')).toUpperCase()}_DISABLED'] = Joi.boolean().default(defaults.disabled ?? false);`,
      'return schema'
    ]
  });
}
