import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { CoerceSuffix } from '@rxap/utilities';

export function AddMethodClass(
  sourceFile: SourceFile,
  name: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  returnType: string                                                  = 'any',
  parameterType: string                                               = 'any',
  isAsync?: boolean
): void {

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
    implements: [ `Method<${returnType}, ${parameterType}>` ],
    methods:    [
      {
        name:       'call',
        isAsync:    isAsync,
        parameters: [ { name: 'parameters', type: parameterType } ],
        returnType: isAsync ? `Promise<${returnType}>` : returnType
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
  sourceFile.addImportDeclarations(structures);

}
