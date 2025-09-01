import {
  CoerceSourceFile,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { underscore } from '@rxap/utilities';
import {
  Project,
  VariableDeclarationKind,
} from 'ts-morph';

export function coerceDynamicModuleOptionsToken(project: Project, moduleName: string) {
  const tokenName = underscore(`${moduleName}Options`).toUpperCase();
  const sourceFile = CoerceSourceFile(project, 'tokens.ts');
  CoerceVariableDeclaration(sourceFile, tokenName, {
    initializer: `Symbol('${tokenName}')`,
  }, {
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
  });
}
