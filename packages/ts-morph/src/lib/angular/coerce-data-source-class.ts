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

  /**
   * The name of the data source (without 'DataSource' suffix).
   */
  name: string;
  /**
   * If true, provides the service in 'root'.
   */
  providedInRoot?: boolean;

  /**
   * Decorator configuration for the data source.
   */
  decorator?: {
    name: string;
    moduleSpecifier: string;
    argument?: string | WriterFunction;
  };
  /**
   * Base class configuration.
   */
  extends?: {
    name: string;
    moduleSpecifier: string;
  };
  /**
   * Custom hook to coerce the decorator.
   */
  coerceDecorator?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceDataSourceClassOptions,
  ) => void;
  /**
   * Custom hook to coerce the extends clause.
   */
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

/**
 * Coerces a data source class for RxAP.
 * Creates a class extending `BaseDataSource` and decorated with `RxapDataSource`.
 *
 * @param sourceFile - The source file to add the data source to.
 * @param options - Options for the data source class.
 * @returns The created class declaration.
 */
export function CoerceDataSourceClass(sourceFile: SourceFile, options: CoerceDataSourceClassOptions) {

  const {
    providedInRoot,
    name,
    coerceDecorator = CoerceRxapDataSourceDecorator,
    coerceExtends = CoerceExtendsBaseDataSource,
  } = options;

  // the option object will be used in hooks. so it is required to modify the object directly to keep the reference
  // intact instead of using the object destruction
  options.extends ??= {
    name: 'BaseDataSource',
    moduleSpecifier: '@rxap/data-source',
  };
  options.decorator ??= {
    name: 'RxapDataSource',
    moduleSpecifier: '@rxap/data-source',
  };
  options.decorator.argument ??= w => w.quote(options.name);

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
