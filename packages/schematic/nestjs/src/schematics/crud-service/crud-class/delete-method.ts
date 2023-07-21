import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function DeleteMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { classified, dtoName, documentId, camelized, collection, parentCollectionList } = options;
  return {
    name: 'delete',
    scope: Scope.Public,
    isAsync: true,
    parameters: [
      ...parentCollectionList.map(subCollection => ({
        name: `${ camelize(subCollection) }Id`,
        type: 'string',
      })),
      {
        name: `${ documentId }`,
        type: 'string',
      },
    ],
    returnType: 'Promise<void>',
    statements: [
      `this.logger.verbose('delete: ' + ${ documentId }, '${ className }')`,
      writer => {
        writer.write('await this.firestore');
        for (const subCollection of parentCollectionList) {
          writer.writeLine(`.collection(Collection.${ underscore(subCollection).toUpperCase() })`);
          writer.writeLine(`.doc(${ camelize(subCollection) }Id)`);
        }
        writer.writeLine(`.collection(Collection.${ underscore(collection).toUpperCase() })`);
        writer.writeLine(`.doc(${ documentId })`);
        if (options.privateName) {
          writer.writeLine(`.collection(Collection.PRIVATE)`);
          writer.writeLine(`.doc('${ options.privateName }')`);
        }
        writer.writeLine('.delete()');
        writer.writeLine('.catch(FirestoreErrorHandler(this.logger));');
      },
      `this.logger.debug('deleted: ' + ${ documentId }, '${ className }')`,
    ],
  };
}
