import { chain } from '@angular-devkit/schematics';
import {
  BackendTypes,
} from '@rxap/schematic-angular';
import { TsMorphAngularProjectTransformRule } from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import {
  CoerceImports,
  CoerceModuleProvider,
  CoerceStories,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { NormalizedAccordionComponentOptions } from './normalize-accordion-component-options';
import { buildGetOperationId } from './build-get-operation-id';

export function storiesRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    project,
    feature,
    directory,
    componentName,
    shared,
    backend,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion component stories ...'),
    TsMorphAngularProjectTransformRule({
      project,
      feature,
      directory,
      shared,
    }, (_, [ sourceFile ]) => {
      CoerceStories(sourceFile, {
        componentName,
        feature,
        moduleMetadata: (moduleDecoratorObject) => {
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: '@faker-js/faker',
              namedImports: [ 'faker' ],
            },
            {
              moduleSpecifier: 'angular-testing',
              namedImports: [ 'ProvideActivatedRoutes' ],
            },
          ]);
          CoerceModuleProvider(
            moduleDecoratorObject, 'ProvideActivatedRoutes({params: {uuid: faker.datatype.uuid()}})');
          if (backend.kind === BackendTypes.NESTJS) {
            const operationId = buildGetOperationId(normalizedOptions);
            const methodName = OperationIdToRemoteMethodClassName(operationId);
            const methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(
              operationId, normalizedOptions.scope);
            CoerceImports(sourceFile, [
              {
                namedImports: [ methodName ],
                moduleSpecifier: methodModuleSpecifier,
              },
              {
                moduleSpecifier: 'angular-testing',
                namedImports: [ 'ProvideMethodMock' ],
              },
            ]);
            CoerceModuleProvider(
              moduleDecoratorObject, `ProvideMethodMock(${ methodName }, () => ({ uuid: faker.datatype.uuid() }))`);
          }
        },
      });
    }, [ `${ dasherize(componentName) }.component.stories.ts?` ]),
  ]);


}