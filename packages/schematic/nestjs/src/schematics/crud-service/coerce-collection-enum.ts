import { underscore } from '@angular-devkit/core/src/utils/strings';
import { CoerceSourceFile } from '@rxap/schematics-ts-morph';
import {
  EnumDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';

export function CoerceEnum(sourceFile: SourceFile, name: string): EnumDeclaration {

  let enumDeclaration: EnumDeclaration | undefined = sourceFile.getEnum(name);

  if (!enumDeclaration) {
    enumDeclaration = sourceFile.addEnum({ name, isExported: true });
  }

  return enumDeclaration;

}

export function CoerceEnumProperty(
  sourceFile: SourceFile,
  name: string,
  propertyKey: string,
  value: string | number | undefined,
): void {

  const enumDeclaration = CoerceEnum(sourceFile, name);

  if (!enumDeclaration.getMember(propertyKey)) {
    enumDeclaration.addMember({
      name: propertyKey,
      value: value,
    });
  }

}

export function CoerceCollectionEnum(project: Project, collection: string): void {
  const sourceFile = CoerceSourceFile(project, 'lib/collection.ts');
  CoerceEnumProperty(sourceFile, 'Collection', underscore(collection).toUpperCase(), collection);
}
