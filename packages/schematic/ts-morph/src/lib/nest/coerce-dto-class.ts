import {
  ClassDeclarationStructure,
  ClassLikeDeclarationBase,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
  PropertyDeclaration,
  PropertyDeclarationStructure,
  PropertySignature,
  PropertySignatureStructure,
  TypeElementMemberedNode,
  Writers,
} from 'ts-morph';
import { join } from 'path';
import { camelize, classify, CoerceSuffix, dasherize } from '@rxap/schematics-utilities';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { DtoClassProperty } from '../create-dto-class';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceDtoClassOutput {
  className: string;
  filePath: string;
}

export function CoercePropertyDeclaration(typeElementMemberedNode: TypeElementMemberedNode,
                                          name: string,
                                          structure?: Partial<PropertyDeclarationStructure>,
): PropertySignature
export function CoercePropertyDeclaration(
  classLikeDeclarationBase: ClassLikeDeclarationBase,
  name: string,
  structure?: Partial<PropertyDeclarationStructure>,
): PropertyDeclaration
export function CoercePropertyDeclaration(
  node: ClassLikeDeclarationBase | TypeElementMemberedNode,
  name: string,
  structure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'> | Omit<OptionalKind<PropertySignatureStructure>, 'name'> = {},
): PropertyDeclaration | PropertySignature {
  let property = node.getProperty(name);
  if (!property) {
    property = node.addProperty({name});
    property.set(structure as any);
  }
  return property;
}

export function CoerceDtoClass(
  project: Project,
  name: string,
  propertyList: DtoClassProperty[],
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  importStructureList?: Array<OptionalKind<ImportDeclarationStructure>>,
): CoerceDtoClassOutput {

  name = dasherize(name);
  const className = CoerceSuffix(classify(name), 'Dto');
  const fileName = CoerceSuffix(name, '.dto');

  const sourceFile = CoerceSourceFile(project, join('dtos', fileName + '.ts'));
  const classDeclaration = CoerceClass(sourceFile, className);
  classDeclaration.setIsExported(true);
  classDeclaration.set(classStructure ?? {});
  importStructureList ??= [];

  for (const property of propertyList) {

    let propertyName = camelize(property.name);
    const prefixMatch = property.name.match(/^(_+)/);

    if (prefixMatch) {
      propertyName = camelize(property.name.replace(/^_+/, ''));
      propertyName = prefixMatch[0] + propertyName;
    }

    const propertyDeclaration: PropertyDeclaration = CoercePropertyDeclaration(classDeclaration,
      propertyName,
      {
        type: !property.isArray ? property.type : w => {
          w.write('Array<');
          if (typeof property.type === 'string') {
            if (property.type === 'date') {
              w.write('Date');
            } else {
              w.write(property.type);
            }
          } else {
            property.type(w);
          }
          w.write('>');
        },
        hasQuestionToken: property.isOptional,
        hasExclamationToken: !property.isOptional,
      });

    CoerceDecorator(propertyDeclaration, {name: 'Expose', arguments: []});
    importStructureList.push({namedImports: ['Expose'], moduleSpecifier: 'class-transformer'});

    if (property.isArray) {
      CoerceDecorator(propertyDeclaration, {name: 'IsArray', arguments: []});
      importStructureList.push({namedImports: ['IsArray'], moduleSpecifier: 'class-validator'});
    }
    if (property.isType) {
      CoerceDecorator(propertyDeclaration, {
        name: 'Type', arguments: [w => {
          w.write('() => ');
          if (typeof property.type === 'string') {
            if (property.type === 'date') {
              w.write('Date');
            } else {
              w.write(property.type);
            }
          } else {
            property.type(w);
          }
        }],
      });
      importStructureList.push({namedImports: ['Type'], moduleSpecifier: 'class-transformer'});
      CoerceDecorator(propertyDeclaration, {
        name: 'IsInstance', arguments: [
          w => {
            if (typeof property.type === 'string') {
              if (property.type === 'date') {
                w.write('Date');
              } else {
                w.write(property.type);
              }
            } else {
              property.type(w);
            }
          },
          w => {
            if (property.isArray) {
              Writers.object({each: 'true'})(w);
            }
          },
        ],
      });
      importStructureList.push({namedImports: ['IsInstance'], moduleSpecifier: 'class-validator'});
    }
    if (property.isOptional) {
      CoerceDecorator(propertyDeclaration, {name: 'IsOptional', arguments: []});
      importStructureList.push({namedImports: ['IsOptional'], moduleSpecifier: 'class-validator'});
    }
    if (property.type === 'string') {
      if (property.name === 'uuid') {
        importStructureList.push({namedImports: ['IsUUID'], moduleSpecifier: 'class-validator'});
        CoerceDecorator(propertyDeclaration, {name: 'IsUUID', arguments: []});
      } else {
        importStructureList.push({namedImports: ['IsString'], moduleSpecifier: 'class-validator'});
        CoerceDecorator(propertyDeclaration, {name: 'IsString', arguments: []});
      }
    }
    if (property.type === 'boolean') {
      importStructureList.push({namedImports: ['IsBoolean'], moduleSpecifier: 'class-validator'});
      CoerceDecorator(propertyDeclaration, {name: 'IsBoolean', arguments: []});
    }
    if (property.type === 'number') {
      importStructureList.push({namedImports: ['IsBoolean'], moduleSpecifier: 'class-validator'});
      CoerceDecorator(propertyDeclaration, {name: 'IsBoolean', arguments: []});
    }

  }

  CoerceImports(sourceFile, importStructureList);

  return {
    className,
    filePath: join(sourceFile.getDirectoryPath(), sourceFile.getBaseNameWithoutExtension()),
  };

}
