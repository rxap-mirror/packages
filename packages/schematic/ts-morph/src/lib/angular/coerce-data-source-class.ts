import {ClassDeclaration, Project, SourceFile} from 'ts-morph';
import {classify, CoerceSuffix} from '@rxap/schematics-utilities';
import {TsMorphAngularProjectTransform} from '../ts-morph-transform';
import {CoerceImports} from '../ts-morph/coerce-imports';
import {CoerceSourceFile} from '../coerce-source-file';
import {CoerceClass} from '../coerce-class';

export interface CoerceDataSourceClassOptions {
  name: string;
  project: string;
  feature: string;
  shared: boolean;
  directory: string;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceDataSourceClass(options: CoerceDataSourceClassOptions) {
  let {name, tsMorphTransform} = options;
  tsMorphTransform ??= () => undefined;
  const className = classify(CoerceSuffix(name, 'DataSource'));
  const fileName = CoerceSuffix(name, '.data-source.ts');
  return TsMorphAngularProjectTransform(options, (project: Project) => {

    const sourceFile = CoerceSourceFile(project, fileName);
    const classDeclaration = CoerceClass(sourceFile, className, {
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: [],
        },
        {
          name: 'RxapDataSource',
          arguments: [w => w.quote(name)],
        },
      ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/data-source',
      namedImports: ['RxapDataSource'],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: ['Injectable'],
    });
    tsMorphTransform!(project, sourceFile, classDeclaration);

  });
}
