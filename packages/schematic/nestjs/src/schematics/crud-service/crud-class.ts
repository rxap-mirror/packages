import { CoerceClass } from '@rxap/schematics-ts-morph';
import {
  Scope,
  SourceFile,
} from 'ts-morph';
import { CreateMethod } from './crud-class/create-method';
import { DeleteMethod } from './crud-class/delete-method';
import { ExistsMethod } from './crud-class/exists-method';
import { FindInGroupMethod } from './crud-class/find-in-group-method';
import { FindMethod } from './crud-class/find-method';
import { GetMethod } from './crud-class/get-method';
import { UpdateMethod } from './crud-class/update-method';
import { Options } from './options';
import { UpdateFieldMethod } from './crud-class/update-field-method';

export function CrudClass(sourceFile: SourceFile, options: Options): void {
  const { classified, dtoName, dasherized } = options;

  if (options.overwrite) {
    // TODO : replace hack with correct implementation to remove all statements
    const count = sourceFile.getStatements().length;
    for (let i = 0; i < count; i++) {
      sourceFile.removeStatement(0);
    }
  }

  sourceFile.addImportDeclarations([
    {
      namedImports: [
        'InternalServerErrorException',
        'BadRequestException',
        'Logger',
        'Inject',
        'NotFoundException',
        'Injectable',
      ],
      moduleSpecifier: '@nestjs/common',
    },
    {
      namedImports: [ 'validateSync' ],
      moduleSpecifier: 'class-validator',
    },
    {
      namedImports: [ 'classToPlain', 'plainToClass' ],
      moduleSpecifier: 'class-transformer',
    },
    {
      namedImports: [ 'FIRESTORE', 'Firestore', 'FirestoreErrorHandler' ],
      moduleSpecifier: '@rxap/nest-firebase',
    },
    {
      namedImports: [ 'CrudTransformOptions' ],
      moduleSpecifier: './transform-options',
    },
    {
      namedImports: [ 'CrudValidatorOptions' ],
      moduleSpecifier: './validator-options',
    },
    {
      namedImports: [ 'ValidationException' ],
      moduleSpecifier: '@rxap/nest-utilities',
    },
    {
      namedImports: [ 'FieldPath', 'Query', 'QuerySnapshot' ],
      moduleSpecifier: 'firebase-admin/firestore',
    },
    {
      namedImports: [ `${ dtoName }` ],
      moduleSpecifier: `./${ dasherized }/${ dasherized }.crud.dto`,
    },
    {
      namedImports: [ `Collection` ],
      moduleSpecifier: `./collection`,
    },
    {
      namedImports: [ `Create${ dtoName }` ],
      moduleSpecifier: `./${ dasherized }/create-${ dasherized }.crud.dto`,
    },
    {
      namedImports: [ `Update${ dtoName }` ],
      moduleSpecifier: `./${ dasherized }/update-${ dasherized }.crud.dto`,
    },
  ]);

  const className = classified + 'CrudService';

  const methods = [
    CreateMethod(options, className),
    DeleteMethod(options, className),
    UpdateMethod(options, className),
    GetMethod(options, className),
    ExistsMethod(options, className),
    UpdateFieldMethod(options, className),
  ];

  if (!options.privateName) {
    methods.push(FindMethod(options, className));
    methods.push(FindInGroupMethod(options, className));
  }

  CoerceClass(sourceFile, className, {
    isExported: true,
    decorators: [
      {
        name: 'Injectable',
        arguments: [],
      },
    ],
    ctors: [
      {
        parameters: [
          {
            scope: Scope.Private,
            isReadonly: true,
            name: 'logger',
            type: 'Logger',
            decorators: [ { name: 'Inject', arguments: [ 'Logger' ] } ],
          },
          {
            scope: Scope.Private,
            isReadonly: true,
            name: 'firestore',
            type: 'Firestore',
            decorators: [ { name: 'Inject', arguments: [ 'FIRESTORE' ] } ],
          },
        ],
      },
    ],
    methods,
  });

}
