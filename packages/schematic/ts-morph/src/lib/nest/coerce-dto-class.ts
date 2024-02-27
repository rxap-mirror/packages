import {
  camelize,
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceClass,
  CoerceDecorator,
  CoerceImports,
  CoerceSourceFile,
  WriteType,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  ClassLikeDeclarationBase,
  ObjectLiteralExpression,
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
import {
  DtoClassProperty,
  NormalizeDataClassProperty,
} from './dto-class-property';
import 'colors';

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
  propertyList?: DtoClassProperty[];
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceDtoClass(options: CoerceDtoClassOptions): CoerceDtoClassOutput {
  const {
    project,
    propertyList = [],
    tsMorphTransform = noop,
  } = options;
  let {
    name,
  } = options;

  name = dasherize(name);

  const className = CoerceSuffix(classify(name), 'Dto');
  const fileName = CoerceSuffix(name, '.dto');

  const sourceFile = CoerceSourceFile(project, join('dtos', fileName + '.ts'));
  const classDeclaration = CoerceClass(sourceFile, className);
  classDeclaration.setIsExported(true);

  for (const property of propertyList.map(NormalizeDataClassProperty)) {

    if (property.type.name === '<self>') {
      property.type.name = className;
      property.isType = true;
    }

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
      hasQuestionToken: property.isOptional,
      hasExclamationToken: !property.isOptional,
    });

    CoerceDecorator(
      propertyDeclaration,
      'Expose',
      {
        arguments: [],
      },
    );
    CoerceImports(sourceFile,{
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
      CoerceImports(sourceFile,{
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
       CoerceImports(sourceFile,{
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
       CoerceImports(sourceFile,{
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
       CoerceImports(sourceFile,{
        namedImports: [ 'IsOptional' ],
        moduleSpecifier: 'class-validator',
      });
    }

    switch (property.type.name) {
      case 'date':
        CoerceDecorator(
          propertyDeclaration,
          'IsDate',
          {
            arguments: [],
          },
        );
         CoerceImports(sourceFile,{
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
         CoerceImports(sourceFile,{
          namedImports: [ 'IsNumber' ],
          moduleSpecifier: 'class-validator',
        });
        break;
      case 'string':
        if (property.name === 'uuid') {
           CoerceImports(sourceFile,{
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
           CoerceImports(sourceFile,{
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
         CoerceImports(sourceFile,{
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
         CoerceImports(sourceFile,{
          namedImports: [ 'IsBoolean' ],
          moduleSpecifier: 'class-validator',
        });
        break;
        case 'unknown':
          CoerceDecorator(
            propertyDeclaration,
            'ApiProperty',
            {
              arguments: [Writers.object({ type: w => w.quote('unknown')})],
            },
          );
           CoerceImports(sourceFile,{
            namedImports: [ 'ApiProperty' ],
            moduleSpecifier: '@nestjs/swagger',
          });
          break;
    }

    if (property.type.name !== 'unknown') {
      const apiProperty = propertyDeclaration.getDecorators().find(d => d.getName() === 'ApiProperty');
      if (apiProperty) {
        const args = apiProperty.getArguments()[0];
        if (args instanceof ObjectLiteralExpression) {
          if (args.getProperty('type')?.getText().includes('unknown')) {
            apiProperty.remove();
          }
        }
      }
    }

  }

  tsMorphTransform(project, sourceFile, classDeclaration);

  return {
    className,
    filePath: '.' + join(sourceFile.getDirectoryPath(), sourceFile.getBaseNameWithoutExtension()),
    sourceFile,
    classDeclaration,
  };

}
