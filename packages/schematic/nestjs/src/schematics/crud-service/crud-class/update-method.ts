import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function UpdateMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { classified, documentId, dtoName, camelized, collection, parentCollectionList, privateName } = options;
  return {
    name: 'update',
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
      {
        name: `update${ dtoName }`,
        type: `Update${ dtoName }`,
      },
    ],
    returnType: `Promise<${ dtoName }>`,
    statements: [
      `this.logger.verbose('update: ' + ${ documentId }, '${ className }')`,
      `if (!(update${ dtoName } instanceof Update${ dtoName })) { throw new InternalServerErrorException('Not instance of Update${ dtoName }') }`,
      `const result = validateSync(update${ dtoName }, CrudValidatorOptions());`,
      `if (result.length) { throw new ValidationException(result); }`,
      writer => {
        writer.writeLine(`const plain = classToPlain(update${ dtoName }, CrudTransformOptions())`);
        writer.writeLine('plain.__updatedAt = new Date()');
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
        writer.writeLine(`.update(plain)`);
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
