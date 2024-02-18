import { CoerceSuffix } from '@rxap/schematics-utilities';
import { TypeImport } from '@rxap/ts-morph';
import {
  ClassDeclaration,
  ClassDeclarationStructure,
  DecoratorStructure,
  ImportDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  WriteStringType,
  WriteType,
} from '../ts-morph/write-type';

export interface DtoClassProperty {
  name: string,
  /**
   * The type of the property
   *
   * if type = '<self>' the type will be the name of the class
   */
  type: string | WriterFunction | TypeImport | '<self>',
  isArray?: boolean | null,
  /**
   * indicates that the @Type decorator should be used as the type of the property is another dto class
   */
  isType?: boolean | null,
  isOptional?: boolean | null,
  /**
   * Use to import the type
   * @deprecated use the type property with a TypeImport object
   */
  moduleSpecifier?: string | null,
}

export function DtoClassPropertyToPropertySignatureStructure(
  { name, type, isArray, isOptional, moduleSpecifier }: DtoClassProperty,
  sourceFile?: SourceFile,
): OptionalKind<PropertySignatureStructure> {
  const structure: OptionalKind<PropertySignatureStructure> = {
    name,
    type: WriteType({ type, isArray }, sourceFile),
  };
  if (sourceFile && moduleSpecifier && typeof type === 'string') {
    CoerceImports(sourceFile, { namedImports: [ type ], moduleSpecifier });
  }
  if (isOptional) {
    structure.hasQuestionToken = true;
  }
  return structure;
}

export function CreateDtoClass(
  sourceFile: SourceFile,
  className: string,
  propertyList: DtoClassProperty[],
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  structures?: Array<OptionalKind<ImportDeclarationStructure>>,
): ClassDeclaration {

  className = CoerceSuffix(className, 'Dto');
  classStructure ??= {};
  classStructure.properties ??= [];
  classStructure.isExported = true;
  for (const property of propertyList) {
    const decorators: Array<OptionalKind<DecoratorStructure>> = [
      {
        name: 'Expose',
        arguments: [],
      },
    ];
    CoerceImports(
      sourceFile,
      {
        namedImports: [ 'Expose' ],
        moduleSpecifier: 'class-transformer',
      },
    );
    if (property.isArray) {
      decorators.push({
        name: 'IsArray',
        arguments: [],
      });
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'IsArray' ],
          moduleSpecifier: 'class-validator',
        },
      );
    }
    if (property.type === '<self>') {
      property.type = className;
      property.isType = true;
    }
    if (property.isType) {
      decorators.push({
        name: 'Type',
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
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'Type' ],
          moduleSpecifier: 'class-transformer',
        },
      );
      decorators.push({
        name: 'IsInstance',
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
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'IsInstance' ],
          moduleSpecifier: 'class-validator',
        },
      );
    }
    if (property.isOptional) {
      decorators.push({
        name: 'IsOptional',
        arguments: [],
      });
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'IsOptional' ],
          moduleSpecifier: 'class-validator',
        },
      );
    }
    if (property.type === 'string') {
      if (property.name === 'uuid') {
        CoerceImports(
          sourceFile,
          {
            namedImports: [ 'IsUUID' ],
            moduleSpecifier: 'class-validator',
          },
        );
        decorators.push({
          name: 'IsUUID',
          arguments: [],
        });
      } else {
        CoerceImports(
          sourceFile,
          {
            namedImports: [ 'IsString' ],
            moduleSpecifier: 'class-validator',
          },
        );
        decorators.push({
          name: 'IsString',
          arguments: [],
        });
      }
    }
    if (property.type === 'boolean') {
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'IsBoolean' ],
          moduleSpecifier: 'class-validator',
        },
      );
      decorators.push({
        name: 'IsBoolean',
        arguments: [],
      });
    }
    if (property.type === 'number') {
      CoerceImports(
        sourceFile,
        {
          namedImports: [ 'IsBoolean' ],
          moduleSpecifier: 'class-validator',
        },
      );
      decorators.push({
        name: 'IsBoolean',
        arguments: [],
      });
    }
    classStructure.properties.push({
      name: property.name,
      type: WriteType(property, sourceFile),
      hasQuestionToken: !!property.isOptional,
      hasExclamationToken: !property.isOptional,
      decorators,
    });
  }
  CoerceImports(sourceFile, structures ?? []);

  return CoerceClass(sourceFile, className, classStructure);

}

export function CreatePageDtoClass(
  sourceFile: SourceFile,
  className: string,
  rowType: string | WriterFunction,
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  structures?: Array<OptionalKind<ImportDeclarationStructure>>,
) {

  className = CoerceSuffix(className, 'PageDto');

  const propertyList: DtoClassProperty[] = [
    {
      name: 'rows',
      type: rowType,
      isArray: true,
      isType: true,
    },
  ];

  classStructure ??= {};
  classStructure.extends = w => {
    w.write('PageDto<');
    if (typeof rowType === 'string') {
      w.write(rowType);
    } else {
      rowType(w);
    }
    w.write('>');
  };
  structures ??= [];
  structures.push({
    namedImports: [ 'PageDto' ],
    moduleSpecifier: '@rxap/nest-dto',
  });

  return CreateDtoClass(sourceFile, className, propertyList, classStructure, structures);

}
