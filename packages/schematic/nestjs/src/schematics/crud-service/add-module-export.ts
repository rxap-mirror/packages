import {
  AddProviderToArray,
  GetCoerceArrayLiteralFromObjectLiteral,
  ProviderObject,
} from '@rxap/schematics-ts-morph';
import {
  ImportDeclarationStructure,
  ObjectLiteralExpression,
  OptionalKind,
  SourceFile,
  Writers,
} from 'ts-morph';

export function GetModuleOptionsObject(sourceFile: SourceFile): ObjectLiteralExpression {


  const classWithNgModule = sourceFile.getClasses().find(cls => cls.getDecorator('Module'));

  if (!classWithNgModule) {
    throw new Error('Could not find class with Module decorator!');
  }

  const moduleDecorator = classWithNgModule.getDecorator('Module')!;
  let moduleOptions = moduleDecorator.getArguments()[0];

  if (!moduleOptions) {
    moduleOptions = moduleDecorator.addArgument(Writers.object({}));
  }

  if (!(moduleOptions instanceof ObjectLiteralExpression)) {
    throw new Error('The Module options is not an object literal expression');
  }

  return moduleOptions;
}

export function AddModuleExport(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  sourceFile.addImportDeclarations(structures);

  const ngModuleOptions = GetModuleOptionsObject(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'exports');

  AddProviderToArray(providerObject, providerArray, overwrite);

}
