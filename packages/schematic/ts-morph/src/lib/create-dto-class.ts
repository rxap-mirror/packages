import {
  ClassDeclaration,
  ClassDeclarationStructure,
  DecoratorStructure,
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from './ts-morph/index';
import { CoerceClass } from './coerce-class';

export interface DtoClassProperty {
  name: string,
  type: string | WriterFunction,
  isArray?: boolean,
  isType?: boolean,
  isOptional?: boolean,
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
    if (property.isType) {
      decorators.push({
        name: 'Type',
        arguments: [
          w => {
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
    moduleSpecifier: '@eurogard/service-nest-utilities',
  });

  return CreateDtoClass(sourceFile, className, propertyList, classStructure, structures);

}
