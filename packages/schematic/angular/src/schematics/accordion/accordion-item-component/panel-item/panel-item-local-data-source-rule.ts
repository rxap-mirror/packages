import { chain } from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceInterfaceRule,
  CoerceMethodClass,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceClassProperty,
  CoerceImports,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { NormalizedAccordionItemComponentOptions } from '../normalize-accordion-item-standalone-component-options';

export function panelItemLocalDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    componentName,
    overwrite,
    backend,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce panel data source ...`),
    CoerceInterfaceRule({
      project,
      feature,
      shared,
      directory,
      backend,
      name: componentName,
      structure: {
        isExported: true,
        properties: [],
      },
    }, TsMorphAngularProjectTransformRule),
    CoerceMethodClass({
      project,
      feature,
      shared,
      directory,
      name: componentName,
      tsMorphTransform: (project, sourceFile) => {
        CoerceImports(sourceFile, [
          {
            namedImports: [ 'faker' ],
            moduleSpecifier: '@faker-js/faker',
          },
          {
            namedImports: [ classify(componentName) ],
            moduleSpecifier: `./${ dasherize(componentName) }`,
          },
        ]);
        return {
          returnType: classify(componentName),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return {} as any;',
          ],
        };
      },
    }),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(name, '-panel'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(`PanelAccordionDataSource<${ classify(componentName) }>`);
        CoerceImports(sourceFile, {
          namedImports: [ classify(componentName) ],
          moduleSpecifier: `./${ dasherize(componentName) }`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ classify(componentName) + 'Method' ],
          moduleSpecifier: `./${ dasherize(componentName) }.method`,
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Inject' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/data-source/accordion',
          namedImports: [ 'PanelAccordionDataSource' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ classify(componentName) + 'Method' })`,
          isReadonly: true,
        });
      },
    }),
    CoerceComponentRule({
      project,
      name: componentName,
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ]) => {
        AddComponentProvider(sourceFile, classify(componentName) + 'Method', [
          {
            moduleSpecifier: `./${ dasherize(componentName) }.method`,
            namedImports: [ classify(componentName) + 'Method' ],
          },
        ]);
      },
    }),
  ]);

}