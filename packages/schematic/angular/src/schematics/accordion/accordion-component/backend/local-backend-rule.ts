import { chain } from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceInterfaceRule,
  CoerceMethodClass,
  CoerceParameterDeclaration,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import {
  CoerceClassConstructor,
  CoerceImports,
  CoerceStatements,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedAccordionComponentOptions } from '../normalize-accordion-component-options';
import { buildPropertyList } from '../build-property-list';

export function localBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    name,
    project,
    feature,
    directory,
    shared,
    overwrite,
    backend,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceInterfaceRule({
      project,
      feature,
      backend,
      shared,
      directory,
      name,
      propertyList: buildPropertyList(normalizedOptions),
    }, TsMorphAngularProjectTransformRule),
    CoerceMethodClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {
        CoerceImports(sourceFile, [
          {
            namedImports: [ classify(name) ],
            moduleSpecifier: `./${ dasherize(name) }`,
          },
        ]);
        return {
          returnType: classify(name),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return { } as any;',
          ],
        };
      },
    }),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(
          `AccordionDataSource<${ classify(name) }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) ],
          moduleSpecifier: `./${ dasherize(name) }`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) + 'Method' ],
          moduleSpecifier: `./${ dasherize(name) }.method`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'AccordionDataSource' ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/router',
          namedImports: [ 'ActivatedRoute' ],
        });
        const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
        CoerceParameterDeclaration(constructorDeclaration, 'method').set({
          type: classify(name) + 'Method',
        });
        CoerceParameterDeclaration(constructorDeclaration, 'route').set({
          type: 'ActivatedRoute',
        });
        CoerceStatements(constructorDeclaration, [ `super(method, route);` ]);
      },
    }),
    CoerceComponentRule({
      project,
      name,
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        AddComponentProvider(sourceFile, classify(name) + 'Method', [
          {
            moduleSpecifier: `./${ dasherize(name) }.method`,
            namedImports: [ classify(name) + 'Method' ],
          },
        ]);
      },
    }),
  ]);

}