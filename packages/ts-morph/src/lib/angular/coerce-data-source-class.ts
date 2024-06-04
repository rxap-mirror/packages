import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';
import {
  classify,
  CoerceSuffix,
} from '@rxap/utilities';

export interface CoerceDataSourceClassOptions {

  name: string;
  providedInRoot?: boolean;

  decorator?: {
    name: string;
    moduleSpecifier: string;
    argument?: string | WriterFunction;
  };
  extends?: {
    name: string;
    moduleSpecifier: string;
  };
  coerceDecorator?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceDataSourceClassOptions,
  ) => void;
  coerceExtends?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceDataSourceClassOptions,
  ) => void;

}

export function CoerceRxapDataSourceDecorator(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  options: CoerceDataSourceClassOptions,
) {
  CoerceDecorator(classDeclaration, options.decorator!.name, { arguments: [ options.decorator!.argument! ] });
  CoerceImports(sourceFile, {
    moduleSpecifier: options.decorator!.moduleSpecifier,
    namedImports: [ options.decorator!.name ],
  });
}

export function CoerceExtendsBaseDataSource(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  options: CoerceDataSourceClassOptions,
) {
  if (!classDeclaration.getExtends()) {
    classDeclaration.setExtends(options.extends!.name);
    CoerceImports(sourceFile, [
      {
        moduleSpecifier: options.extends!.moduleSpecifier,
        namedImports: [ options.extends!.name ],
      },
    ]);
  }
}

export function CoerceDataSourceClass(sourceFile: SourceFile, options: CoerceDataSourceClassOptions) {

  const {
    providedInRoot,
    name,
    coerceDecorator = CoerceRxapDataSourceDecorator,
    coerceExtends = CoerceExtendsBaseDataSource,
    decorator = {
      name: 'RxapDataSource',
      moduleSpecifier: '@rxap/data-source',
    },
  } = options;

  options.extends ??= {
    name: 'BaseDataSource',
    moduleSpecifier: '@rxap/data-source',
  };
  decorator.argument ??= w => w.quote(options.name);

  const className = classify(CoerceSuffix(
    name,
    'DataSource',
  ));

  const classDeclaration = CoerceClass(sourceFile, className, {
    isExported: true,
    decorators: [
      {
        name: 'Injectable',
        arguments: [
          w => {
            if (providedInRoot) {
              w.write(`{ providedIn: 'root' }`);
            }
          },
        ],
      },
    ],
  });
  coerceDecorator(sourceFile, classDeclaration, options);
  coerceExtends(sourceFile, classDeclaration, options);
  CoerceImports(sourceFile, {
    moduleSpecifier: '@angular/core',
    namedImports: [ 'Injectable' ],
  });

  return classDeclaration;

}
