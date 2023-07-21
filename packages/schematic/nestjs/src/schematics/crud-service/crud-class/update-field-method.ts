import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function UpdateFieldMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { classified, documentId, dtoName, camelized, collection, parentCollectionList, privateName } = options;
  return {
    name: 'updateField',
    scope: Scope.Public,
    isAsync: true,
    parameters: [
      ...parentCollectionList.map(collection => ({
        name: `${ camelize(collection) }Id`,
        type: 'string',
      })),
      {
        name: documentId,
        type: 'string',
      },
      /*
       field: string | FieldPath,
       value: any,
       ...moreFieldsOrPrecondition: any[]
       */
      {
        name: 'field',
        type: 'string | FieldPath',
      },
      {
        name: 'value',
        type: 'any',
      },
      {
        name: 'moreFieldsOrPrecondition',
        type: 'any[]',
        isRestParameter: true,
      },
    ],
    returnType: `Promise<${ dtoName }>`,
    statements: [
      `this.logger.verbose('update: ' + ${ documentId }, '${ className }')`,
      writer => {
        writer.write('await this.firestore');
        for (const subCollection of parentCollectionList) {
          writer.writeLine(`.collection(Collection.${ underscore(subCollection).toUpperCase() })`);
          writer.writeLine(`.doc(${ camelize(subCollection) }Id)`);
        }
        writer.writeLine(`.collection(Collection.${ underscore(collection).toUpperCase() })`);
        writer.writeLine(`.doc(${ documentId })`);
        if (privateName) {
          writer.writeLine(`.collection(Collection.PRIVATE)`);
          writer.writeLine(`.doc('${ options.privateName }')`);
        }
        writer.writeLine(`.update(field, value, ...moreFieldsOrPrecondition)`);
        writer.writeLine('.catch(FirestoreErrorHandler(this.logger));');
      },
      `this.logger.debug('updated: ' + ${ documentId }, '${ className }')`,
      `return this.get(${ [
        ...parentCollectionList.map(collection => `${ camelize(collection) }Id`),
        `${ documentId }`,
      ].join(', ') })`,
    ],
  };
}
