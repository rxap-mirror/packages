import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  ArrayRefSchemaObject,
  COMPONENTS_BASE_PATH,
  IsArrayRefSchemaObject,
  IsRefSchemaObject,
} from '@rxap/workspace-open-api';
import {
  join,
  relative,
} from 'path';
import { Project } from 'ts-morph';
import { RefSchemaObject } from './ref-schema-object';

export function CreateComponentTypeAliasSourceFile(
  project: Project,
  operationId: string,
  schema: RefSchemaObject | ArrayRefSchemaObject,
  basePath: string,
  fileSuffix: string,
) {
  const sourceFile = project.createSourceFile(join(basePath, `${ dasherize(operationId) }.${ fileSuffix }.ts`));
  const ref = IsRefSchemaObject(schema) ? schema.$ref : schema.items.$ref;
  const componentName = ref.replace('#/components/schemas/', '');
  let type = classify(componentName);
  if (IsArrayRefSchemaObject(schema)) {
    type += '[]';
  }
  sourceFile.addTypeAlias({
    name: classify(operationId) + classify(fileSuffix),
    isExported: true,
    type
  });
  sourceFile.addImportDeclarations([{
    namedImports: [classify(componentName)],
    moduleSpecifier: `${relative(basePath, '')}/${COMPONENTS_BASE_PATH}/${ dasherize(componentName) }`
  }]);
}
