import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceDataSourceClassOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  providedInRoot?: boolean;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
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
  CoerceDecorator(classDeclaration, 'RxapDataSource', { arguments: [ w => w.quote(options.name) ] });
  CoerceImports(sourceFile, {
    moduleSpecifier: '@rxap/data-source',
    namedImports: [ 'RxapDataSource' ],
  });
}

export function CoerceExtendsBaseDataSource(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  options: CoerceDataSourceClassOptions,
) {
  if (!classDeclaration.getExtends()) {
    classDeclaration.setExtends('BaseDataSource');
    CoerceImports(sourceFile, [
      {
        moduleSpecifier: '@rxap/data-source',
        namedImports: [ 'BaseDataSource' ],
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
  const className = classify(CoerceSuffix(
    name,
    'DataSource',
  ));
  const fileName = CoerceSuffix(name, '.data-source.ts');
  return TsMorphAngularProjectTransform(options, (project) => {

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
