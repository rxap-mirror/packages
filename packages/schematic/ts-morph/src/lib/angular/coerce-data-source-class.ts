import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceSourceFile } from '../coerce-source-file';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceDataSourceClassOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  providedInRoot?: boolean;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
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

export function CoerceDataSourceClass(options: CoerceDataSourceClassOptions) {
  let {
    name,
    tsMorphTransform,
    coerceDecorator,
    providedInRoot,
    coerceExtends,
  } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {
  };
  coerceDecorator ??= CoerceRxapDataSourceDecorator;
  coerceExtends ??= CoerceExtendsBaseDataSource;
  options.decorator ??= {
    name: 'RxapDataSource',
    moduleSpecifier: '@rxap/data-source',
  };
  options.extends ??= {
    name: 'BaseDataSource',
    moduleSpecifier: '@rxap/data-source',
  };
  options.decorator.argument ??= w => w.quote(options.name);
  const className = classify(CoerceSuffix(
    name,
    'DataSource',
  ));
  const fileName = CoerceSuffix(name, '.data-source.ts');
  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, fileName);
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
    coerceDecorator!(sourceFile, classDeclaration, options);
    coerceExtends!(sourceFile, classDeclaration, options);
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Injectable' ],
    });
    tsMorphTransform!(project, sourceFile, classDeclaration);

  });
}
