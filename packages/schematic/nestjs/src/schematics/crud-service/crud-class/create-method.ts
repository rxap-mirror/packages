import { underscore } from '@angular-devkit/core/src/utils/strings';
import {
  MethodDeclarationStructure,
  OptionalKind,
  Scope,
} from 'ts-morph';
import { Options } from '../options';
import { camelize } from '@rxap/schematics-utilities';

export function CreateMethod(options: Options, className: string): OptionalKind<MethodDeclarationStructure> {
  const { classified, dtoName, camelized, documentId, collection, parentCollectionList, privateName } = options;
  let parameters = [
    {
      name: `create${ dtoName }`,
      type: `Create${ dtoName }`,
    },
    {
      name: `${ documentId }`,
      type: 'string',
      hasQuestionToken: !options.privateName,
    },
  ];
  if (privateName) {
    parameters = parameters.reverse();
  }
  parameters.unshift(...parentCollectionList.map(subCollection => ({
    name: `${ camelize(subCollection) }Id`,
    type: 'string',
  })));
  return {
    name: 'create',
    scope: Scope.Public,
    isAsync: true,
    parameters,
    returnType: `Promise<${ dtoName }>`,
    statements: [
      `this.logger.verbose('create: ' + ${ documentId }, '${ className }')`,
      `if (!(create${ dtoName } instanceof Create${ dtoName })) { throw new InternalServerErrorException('Not instance of Create${ dtoName }') }`,
      `const ${ camelized } = ${ dtoName }.FromCreate${ dtoName }(create${ dtoName }, ${ [
        ...parentCollectionList.map(subCollection => `${ camelize(subCollection) }Id`),
        documentId,
      ] });`,
      `const result = validateSync(${ camelized }, CrudValidatorOptions());`,
      `if (result.length) { throw new ValidationException(result); }`,
      writer => {
        writer.writeLine(`const plain = classToPlain(${ camelized }, CrudTransformOptions())`);
        writer.writeLine('plain.__createdAt = new Date()');
        writer.writeLine('plain.__updatedAt = new Date()');
        writer.write('await this.firestore');
        for (const subCollection of parentCollectionList) {
          writer.writeLine(`.collection(Collection.${ underscore(subCollection).toUpperCase() })`);
          writer.writeLine(`.doc(${ camelize(subCollection) }Id)`);
        }
        writer.writeLine(`.collection(Collection.${ underscore(collection).toUpperCase() })`);
        if (privateName) {
          writer.writeLine(`.doc(${ documentId })`);
          writer.writeLine(`.collection(Collection.PRIVATE)`);
          writer.writeLine(`.doc('${ privateName }')`);
        } else {
          writer.writeLine(`.doc(${ camelized }.id)`);
        }
        writer.writeLine(`.set(plain)`);
        writer.writeLine('.catch(FirestoreErrorHandler(this.logger));');
      },
      `this.logger.debug('created: ' + ${ documentId }, '${ className }')`,
      `return ${ camelized }`,
    ],
  };
}
