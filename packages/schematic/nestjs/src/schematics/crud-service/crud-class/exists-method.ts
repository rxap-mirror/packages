import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function ExistsMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { dtoName, documentId, collection, parentCollectionList } = options;
  return {
    name: 'exists',
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
    ],
    returnType: `Promise<${ dtoName }>`,
    statements: [
      `this.logger.verbose('exists: ' + ${ documentId }, '${ className }')`,
      writer => {
        writer.write(`const snapshot = await this.firestore`);
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
        writer.writeLine('.get()');
        writer.writeLine('.catch(FirestoreErrorHandler(this.logger));');
        writer.writeLine('return snapshot.exists');
      },
    ],
  };
}
