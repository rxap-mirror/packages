import {
  camelize,
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  ClassDeclarationStructure,
  ClassLikeDeclarationBase,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
  PropertyDeclaration,
  PropertyDeclarationStructure,
  PropertySignature,
  PropertySignatureStructure,
  SourceFile,
  TypeElementMemberedNode,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { WriteType } from '@rxap/ts-morph';
import { DtoClassProperty } from './create-dto-class';

export interface CoerceDtoClassOutput {
  className: string;
  filePath: string;
  sourceFile: SourceFile;
  classDeclaration: ClassDeclaration;
}

/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoercePropertyDeclaration(
  typeElementMemberedNode: TypeElementMemberedNode,
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
    property = node.addProperty({ name });
    property.set(structure as any);
  }
  return property;
}

export interface CoerceDtoClassOptions {
  project: Project;
  name: string;
  propertyList?: DtoClassProperty[] | null;
  /**
   * @deprecated use the tsMorphTransform to adapt the class
   */
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>;
  /**
   * @deprecated use the tsMorphTransform to add imports
   */
  importStructureList?: Array<OptionalKind<ImportDeclarationStructure>>;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceDtoClass(options: CoerceDtoClassOptions): CoerceDtoClassOutput {
  const {
    project,
  } = options;
  let {
    propertyList,
    tsMorphTransform,
    classStructure,
    importStructureList,
    name,
  } = options;

  propertyList ??= [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};
  classStructure ??= {};
  importStructureList ??= [];
  name = dasherize(name);

  const className = CoerceSuffix(classify(name), 'Dto');
  const fileName = CoerceSuffix(name, '.dto');

  const sourceFile = CoerceSourceFile(project, join('dtos', fileName + '.ts'));
  const classDeclaration = CoerceClass(sourceFile, className);
  classDeclaration.setIsExported(true);
  classDeclaration.set(classStructure);

  for (const property of propertyList) {

    let propertyName = camelize(property.name);
    const prefixMatch = property.name.match(/^(_+)/);

    if (prefixMatch) {
      propertyName = camelize(property.name.replace(/^_+/, ''));
      propertyName = prefixMatch[0] + propertyName;
    }

    const propertyDeclaration: PropertyDeclaration = CoercePropertyDeclaration(
      classDeclaration,
      propertyName,
    ).set({
      type: WriteType(property, sourceFile),
      hasQuestionToken: !!property.isOptional,
      hasExclamationToken: !property.isOptional,
    });

    CoerceDecorator(
      propertyDeclaration,
      'Expose',
      {
        arguments: [],
      },
    );
    importStructureList.push({
      namedImports: [ 'Expose' ],
      moduleSpecifier: 'class-transformer',
    });

    if (property.isArray) {
      CoerceDecorator(
        propertyDeclaration,
        'IsArray',
        {
          arguments: [],
        },
      );
      importStructureList.push({
        namedImports: [ 'IsArray' ],
        moduleSpecifier: 'class-validator',
      });
    }
    if (property.isType) {
      CoerceDecorator(propertyDeclaration, 'Type', {
        arguments: [
          w => {
            w.write('() => ');
            WriteType({
              type: property.type,
              isArray: false
            }, sourceFile)(w);
          },
        ],
      });
      importStructureList.push({
        namedImports: [ 'Type' ],
        moduleSpecifier: 'class-transformer',
      });
      CoerceDecorator(propertyDeclaration, 'IsInstance', {
        arguments: [
          WriteType({
            type: property.type,
            isArray: false
          }, sourceFile),
          w => {
            if (property.isArray) {
              Writers.object({ each: 'true' })(w);
            }
          },
        ],
      });
      importStructureList.push({
        namedImports: [ 'IsInstance' ],
        moduleSpecifier: 'class-validator',
      });
    }
    if (property.isOptional) {
      CoerceDecorator(
        propertyDeclaration,
        'IsOptional',
        {
          arguments: [],
        },
      );
      importStructureList.push({
        namedImports: [ 'IsOptional' ],
        moduleSpecifier: 'class-validator',
      });
    }
    let autoType = 'none';
    if (typeof property.type === 'string') {
      autoType = property.type;
    } else if (typeof property.type === 'object') {
      autoType = property.type.name;
    }
    switch (autoType) {
      case 'date':
        CoerceDecorator(
          propertyDeclaration,
          'IsDate',
          {
            arguments: [],
          },
        );
        importStructureList.push({
          namedImports: [ 'IsDate' ],
          moduleSpecifier: 'class-validator',
        });
        break;
      case 'number':
        CoerceDecorator(
          propertyDeclaration,
          'IsNumber',
          {
            arguments: [],
          },
        );
        importStructureList.push({
          namedImports: [ 'IsNumber' ],
          moduleSpecifier: 'class-validator',
        });
        break;
      case 'string':
        if (property.name === 'uuid') {
          importStructureList.push({
            namedImports: [ 'IsUUID' ],
            moduleSpecifier: 'class-validator',
          });
          CoerceDecorator(
            propertyDeclaration,
            'IsUUID',
            {
              arguments: [],
            },
          );
        } else {
          importStructureList.push({
            namedImports: [ 'IsString' ],
            moduleSpecifier: 'class-validator',
          });
          CoerceDecorator(
            propertyDeclaration,
            'IsString',
            {
              arguments: [],
            },
          );
        }
        break;
      case 'uuid':
        CoerceDecorator(
          propertyDeclaration,
          'IsUUID',
          {
            arguments: [],
          },
        );
        importStructureList.push({
          namedImports: [ 'IsUUID' ],
          moduleSpecifier: 'class-validator',
        });
        break;
      case 'boolean':
        CoerceDecorator(
          propertyDeclaration,
          'IsBoolean',
          {
            arguments: [],
          },
        );
        importStructureList.push({
          namedImports: [ 'IsBoolean' ],
          moduleSpecifier: 'class-validator',
        });
        break;
    }

  }

  CoerceImports(sourceFile, importStructureList);

  tsMorphTransform(project, sourceFile, classDeclaration);

  return {
    className,
    filePath: '.' + join(sourceFile.getDirectoryPath(), sourceFile.getBaseNameWithoutExtension()),
    sourceFile,
    classDeclaration,
  };

}
