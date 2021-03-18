import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure,
  Scope,
  WriterFunction,
  StatementStructures
} from 'ts-morph';
import { CoerceSuffix } from '@rxap/utilities';

export interface AddMethodClassOptions {
  structures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>;
  returnType?: string;
  parameterType?: string;
  isAsync?: boolean;
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction | null
}

export const DEFAULT_ADD_METHOD_CLASS_OPTIONS: Required<AddMethodClassOptions> = {
  structures:    [],
  returnType:    'any',
  parameterType: 'any',
  isAsync:       false,
  statements:    null
};

export function AddMethodClass(
  sourceFile: SourceFile,
  name: string,
  options: AddMethodClassOptions = {}
): void {

  const parameters: Required<AddMethodClassOptions> = Object.assign({}, DEFAULT_ADD_METHOD_CLASS_OPTIONS, options);

  name = CoerceSuffix(name, 'Method');

  sourceFile.addClass({
    name:       name,
    isExported: true,
    decorators: [
      {
        name:      'Injectable',
        arguments: []
      }
    ],
    implements: [ `Method<${parameters.returnType}, ${parameters.parameterType}>` ],
    methods:    [
      {
        name:       'call',
        isAsync:    parameters.isAsync,
        scope:      Scope.Public,
        parameters: [ { name: 'parameters', type: parameters.parameterType } ],
        returnType: parameters.isAsync ? `Promise<${parameters.returnType}>` : parameters.returnType,
        statements: parameters.statements ?? []
      }
    ]
  });
  sourceFile.addImportDeclarations([
    {
      namedImports:    [ 'Injectable' ],
      moduleSpecifier: '@angular/core'
    },
    {
      namedImports:    [ 'Method' ],
      moduleSpecifier: '@rxap/utilities'
    }
  ]);
  sourceFile.addImportDeclarations(parameters.structures);

}
