import {
  chain,
  SchematicsException,
} from '@angular-devkit/schematics';
import { CoerceDataSourceClass } from '@rxap/schematics-ts-morph';
import {
  CoerceClassMethod,
  CoerceClassProperty,
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRemoteMethodClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { NormalizedAccordionComponentOptions } from '../normalize-accordion-component-options';

export function openApiDataSourceRule(normalizedOptions: NormalizedAccordionComponentOptions, getOperationId: string) {

  const {
    project,
    feature,
    directory,
    shared,
    scope,
    componentName,
    identifier,
  } = normalizedOptions;

  if (!componentName) {
    throw new SchematicsException(
      'The component name is required! Ensure the normalizedOptions contain the componentName property!');
  }

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: componentName,
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToResponseClassName(getOperationId) ],
          moduleSpecifier:
            OperationIdToResponseClassImportPath(getOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRemoteMethodClassName(getOperationId) ],
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(getOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'AccordionDataSource' ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ OperationIdToRemoteMethodClassName(getOperationId) })`,
          isReadonly: true,
        });
        let parametersType = 'void';
        if (identifier) {
          parametersType = `OpenApiRemoteMethodParameter<${ OperationIdToParameterClassName(getOperationId) }, void>`;
          CoerceImports(sourceFile, {
            namedImports: [ OperationIdToParameterClassName(getOperationId) ],
            moduleSpecifier:
              OperationIdToParameterClassImportPath(getOperationId, scope),
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'OpenApiRemoteMethodParameter' ],
            moduleSpecifier: '@rxap/open-api/remote-method',
          });
          if (identifier.source === 'route') {
            CoerceClassProperty(classDeclaration, 'route', {
              scope: Scope.Protected,
              initializer: 'inject(ActivatedRoute)',
              isReadonly: true,
            });
            CoerceImports(sourceFile, {
              moduleSpecifier: '@angular/router',
              namedImports: [ 'ActivatedRoute' ],
            });
            CoerceImports(sourceFile, {
              namedImports: [ 'map' ],
              moduleSpecifier: 'rxjs/operators',
            });
            CoerceClassMethod(classDeclaration, 'getParameters', {
              statements: [
                `return this.route.paramMap.pipe(map(paramMap => {
            const ${ identifier.property.name } = paramMap.get('${ identifier.property.name }');
            if (!${ identifier.property.name }) {
              throw new Error('The route does not contain the parameter ${ identifier.property.name }');
            }
            return { parameters: { ${ identifier.property.name } } };
            }));`,
              ],
            });
          }
        } else {
          CoerceClassMethod(classDeclaration, 'getParameters', {
            statements: [ 'return undefined;' ],
          });
        }
        classDeclaration.setExtends(
          `AccordionDataSource<${ OperationIdToResponseClassName(getOperationId) }, ${ parametersType }>`,
        );
      },
    }),
  ]);
}