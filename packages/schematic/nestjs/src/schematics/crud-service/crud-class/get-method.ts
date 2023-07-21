import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function GetMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { classified, dtoName, documentId, camelized, collection, parentCollectionList } = options;
  return {
    name: 'get',
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
      `this.logger.verbose('get: ' + ${ documentId }, '${ className }')`,
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
        writer.writeLine('if (!snapshot.exists) {');
        writer.writeLine(`throw new NotFoundException('A ${ collection } document with the provided id does not exists.');`);
        writer.writeLine('}');
        writer.writeLine(`const ${ camelized } = plainToClass(${ dtoName }, snapshot.data(), CrudTransformOptions())`);
        writer.writeLine(`const result = validateSync(${ camelized }, CrudValidatorOptions());`);
        writer.writeLine(`if (result.length) { throw new ValidationException(result); }`);
        writer.write(`return ${ camelized };`);
      },
    ],
  };
}
