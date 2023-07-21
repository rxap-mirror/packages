import { CoerceClass } from '@rxap/schematics-ts-morph';
import { camelize } from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { Options } from '../options';

export function CreateDtoClass(sourceFile: SourceFile, options: Options): void {

  const { classified, dtoName, camelized, collection, parentCollectionList } = options;

  CoerceClass(sourceFile, `Create${ dtoName }`, {
    isExported: true,
    extends: writer => {
      writer.write('OmitType(');
      writer.write(`${ dtoName },`);
      writer.write(`[ ${ [ 'id', ...parentCollectionList.map(pc => camelize(pc) + 'Id') ].map(id => `'${ id }'`)
                                                                                         .join() } ] as const`);
      writer.write(')');
    },
  });

  sourceFile.addImportDeclarations([
    {
      namedImports: [ 'OmitType' ],
      moduleSpecifier: '@nestjs/swagger',
    },
  ]);

}
