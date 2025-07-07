import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  ArrayRefSchemaObject,
  COMPONENTS_BASE_PATH,
  IsArrayRefSchemaObject,
  IsRefSchemaObject,
  IsSchemaObjectNullable,
} from '@rxap/workspace-open-api';
import {
  join,
  relative,
} from 'path';
import { Project } from 'ts-morph';
import { RefSchemaObject } from './ref-schema-object';

/**
 * Creates a TypeScript source file in a specified project with a type alias derived from a given schema object.
 * This function is particularly useful for generating type definitions based on OpenAPI schema components.
 *
 * @param {Project} project - The project within which the source file will be created.
 * @param {string} operationId - A unique identifier for the operation, used to name the generated file and type alias.
 * @param {RefSchemaObject | ArrayRefSchemaObject} schema - The schema object that defines the structure of the type.
 * This can be a direct reference to a schema (`RefSchemaObject`) or a reference to an array of schemas (`ArrayRefSchemaObject`).
 * @param {string} basePath - The base directory path where the new source file will be created.
 * @param {string} fileSuffix - A suffix to append to the operationId for the filename and type alias, aiding in the creation of distinct, descriptive names.
 *
 * The function performs the following operations:
 * 1. Constructs the filename from the operationId and fileSuffix, then creates a new TypeScript file in the specified project.
 * 2. Determines the reference path from the schema object, extracting the component name to be used in type alias and import declarations.
 * 3. Adds a type alias to the source file that corresponds to the schema reference, appending '[]' to the type if the schema is an array type.
 * 4. Adds necessary import declarations for the type based on the extracted component name.
 *
 * Note: This function relies on utility functions like `dasherize`, `classify`, and path manipulation functions (`join`, `relative`) to format names and paths.
 */
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
  if (IsSchemaObjectNullable(schema) && schema.nullable) {
    type += ' | null';
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
