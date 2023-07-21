import { CoerceClass } from '@rxap/schematics-ts-morph';
import { camelize } from '@rxap/schematics-utilities';
import {
  Scope,
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceClassProperty } from '../coerce-class-property';
import { Options } from '../options';

export function DtoClass(sourceFile: SourceFile, options: Options): void {

  const { classified, dtoName, camelized, collection, parentCollectionList } = options;

  const classDeclaration = CoerceClass(sourceFile, dtoName, {
    isExported: true,
  });

  CoerceClassProperty(
    classDeclaration,
    'id',
    {
      type: 'string',
      scope: Scope.Public,
      hasExclamationToken: true,
      decorators: [
        {
          name: 'Expose',
          arguments: [],
        }, {
          name: 'IsUUID',
          arguments: [],
        },
      ],
    },
  );

  for (const parentCollection of parentCollectionList) {
    CoerceClassProperty(
      classDeclaration,
      camelize(parentCollection) + 'Id',
      {
        type: 'string',
        scope: Scope.Public,
        hasExclamationToken: true,
        decorators: [
          {
            name: 'Expose',
            arguments: [],
          }, {
            name: 'IsUUID',
            arguments: [],
          },
        ],
      },
    );
  }

  CoerceClassMethod(
    classDeclaration,
    `FromCreate${ dtoName }`,
    {
      isStatic: true,
      scope: Scope.Public,
      parameters: [
        {
          name: `create${ dtoName }`,
          type: `Create${ dtoName }`,
        },
        ...parentCollectionList.map(parentCollection => ({
          name: `${ camelize(parentCollection) }Id`,
          type: 'string',
        })),
        {
          name: `${ camelized }Id`,
          type: 'string',
          initializer: 'uuid()',
        },
      ],
      statements: Writers.returnStatement(writer => {
        writer.write('plainToClass(');
        writer.writeLine(`${ dtoName },`);
        writer.writeLine('{');
        writer.writeLine(`...classToPlain(create${ dtoName }, CrudTransformOptions()),`);
        writer.writeLine(`id: ${ camelized }Id,`);
        for (const parentCollection of parentCollectionList) {
          writer.writeLine(`${ camelize(parentCollection) }Id,`);
        }
        writer.writeLine('},');
        writer.writeLine('CrudTransformOptions()');
        writer.write(');');
      }),
    },
  );

  CoerceClassMethod(
    classDeclaration,
    `FromUpdate${ dtoName }`,
    {
      isStatic: true,
      scope: Scope.Public,
      parameters: [
        {
          name: `update${ dtoName }`,
          type: `Update${ dtoName }`,
        },
        ...parentCollectionList.map(parentCollection => ({
          name: `${ camelize(parentCollection) }Id`,
          type: 'string',
        })),
        {
          name: `${ camelized }Id`,
          type: 'string',
          initializer: 'uuid()',
        },
      ],
      statements: Writers.returnStatement(writer => {
        writer.write('plainToClass(');
        writer.writeLine(`${ dtoName },`);
        writer.writeLine('{');
        writer.writeLine(`...classToPlain(update${ dtoName }, CrudTransformOptions()),`);
        writer.writeLine(`id: ${ camelized }Id,`);
        for (const parentCollection of parentCollectionList) {
          writer.writeLine(`${ camelize(parentCollection) }Id,`);
        }
        writer.writeLine('},');
        writer.writeLine('CrudTransformOptions()');
        writer.write(');');
      }),
    },
  );

  sourceFile.addImportDeclarations([
    {
      namedImports: [
        {
          name: 'v4',
          alias: 'uuid',
        },
      ],
      moduleSpecifier: 'uuid',
    },
    {
      namedImports: [ 'IsString', 'IsUUID' ],
      moduleSpecifier: 'class-validator',
    },
    {
      namedImports: [ 'plainToClass', 'classToPlain', 'Expose' ],
      moduleSpecifier: 'class-transformer',
    },
    {
      namedImports: [ 'CrudTransformOptions' ],
      moduleSpecifier: '../transform-options',
    },
  ]);

}
