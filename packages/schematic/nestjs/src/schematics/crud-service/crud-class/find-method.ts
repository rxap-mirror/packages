import { underscore } from '@angular-devkit/core/src/utils/strings';
import { camelize } from '@rxap/schematics-utilities';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';

export function FindMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { dtoName, camelized, collection, parentCollectionList } = options;
  return {
    name: 'find',
    scope: Scope.Public,
    isAsync: true,
    parameters: [
      ...parentCollectionList.map(collection => ({
        name: `${ camelize(collection) }Id`,
        type: 'string',
      })),
      {
        name: 'query',
        type: '(queryRef: Query) => Query',
        initializer: 'query => query',
      },
    ],
    returnType: `Promise<${ dtoName }[]>`,
    statements: [
      `this.logger.verbose('find', '${ className }')`,
      writer => {
        writer.write(`const ref = this.firestore`);
        for (const subCollection of parentCollectionList) {
          writer.writeLine(`.collection(Collection.${ underscore(subCollection).toUpperCase() })`);
          writer.writeLine(`.doc(${ camelize(subCollection) }Id)`);
        }
        writer.writeLine(`.collection(Collection.${ underscore(collection).toUpperCase() });`);
        writer.write(`const querySnapshot = await query(ref)`);
        writer.writeLine('.get()');
        writer.writeLine('.catch(FirestoreErrorHandler<QuerySnapshot>(this.logger));');
        writer.writeLine(`const ${ camelized }List = plainToClass(${ dtoName }, querySnapshot.docs.map(doc => doc.data()), CrudTransformOptions());`);
        writer.writeLine(`const result = ${ camelized }List.map(${ camelized } => validateSync(${ camelized }, CrudValidatorOptions())).filter(r => r.length);`);
        writer.writeLine(`if (result.length) { throw new ValidationException(result.flat()); }`);
        writer.write(`return ${ camelized }List;`);
      },
    ],
  };
}
