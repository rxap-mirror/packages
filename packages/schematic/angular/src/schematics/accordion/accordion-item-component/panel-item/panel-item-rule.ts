import { strings } from '@angular-devkit/core';
import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import {
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoerceImports,
  CoercePropertyDeclaration,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import { Scope } from 'ts-morph';
import { buildGetOperationId } from '../build-get-operation-id';
import { NormalizedAccordionItemComponentOptions } from '../normalize-accordion-item-standalone-component-options';
import { panelItemBackendRule } from './panel-item-backend-rule';

export function panelItemRule(normalizedOptions: NormalizedAccordionItemComponentOptions): Rule {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    componentName,
    importList,
    backend,
  } = normalizedOptions;

  let methodName: string | null = null;
  let methodModuleSpecifier: string | null = null;
  let methodResponse: string | null = null;
  let methodResponseModuleSpecifier: string | null = null;

  if (backend.kind === BackendTypes.NESTJS) {
    const operationId = buildGetOperationId(normalizedOptions);
    methodName = OperationIdToRemoteMethodClassName(operationId);
    methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(operationId, normalizedOptions.scope);
    methodResponse = OperationIdToResponseClassName(operationId);
    methodResponseModuleSpecifier = OperationIdToResponseClassImportPath(operationId, normalizedOptions.scope);
  }

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    method: backend.kind === BackendTypes.NESTJS ? {
      name: methodName,
      moduleSpecifier: methodModuleSpecifier,
      response: methodResponse,
      responseModuleSpecifier: methodResponseModuleSpecifier,
    } : null,
  };

  return chain([
    CoerceComponentRule({
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite: false,
      template: {
        options: templateOptions,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoerceComponentImport(classDeclaration, {
          name: 'DataSourceDirective',
          moduleSpecifier: '@rxap/data-source/directive',
        });
        CoerceComponentImport(classDeclaration, {
          name: 'MatProgressBarModule',
          moduleSpecifier: '@angular/material/progress-bar',
        });
        CoerceComponentImport(classDeclaration, {
          name: 'DataSourceErrorComponent',
          moduleSpecifier: '@rxap/data-source',
        });
        CoerceComponentImport(classDeclaration, {
          name: 'AsyncPipe',
          moduleSpecifier: '@angular/common',
        });
        CoerceComponentImport(classDeclaration, {
          name: 'JsonPipe',
          moduleSpecifier: '@angular/common',
        });
        CoerceComponentImport(classDeclaration, {
          name: 'NgIf',
          moduleSpecifier: '@angular/common',
        });

        const pipeDataSourceName = `${ classify(name) }PanelDataSource`;

        AddComponentProvider(sourceFile, pipeDataSourceName);
        CoerceImports(sourceFile, {
          moduleSpecifier: `./${ dasherize(name) }-panel.data-source`,
          namedImports: [ pipeDataSourceName ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'inject', 'signal', 'computed' ],
          moduleSpecifier: '@angular/core',
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'toSignal' ],
          moduleSpecifier: '@angular/core/rxjs-interop',
        });
        CoercePropertyDeclaration(classDeclaration, 'panelDataSource', {
          isReadonly: true,
          initializer: `inject(${ pipeDataSourceName })`,
          scope: Scope.Public,
        });
        CoercePropertyDeclaration(classDeclaration, 'updating', {
          isReadonly: true,
          initializer: `signal(false)`,
          scope: Scope.Public,
        });
        CoercePropertyDeclaration(classDeclaration, 'loading', {
          isReadonly: true,
          initializer: `computed(() => this.updating() || this.panelDataSource.loading())`,
          scope: Scope.Public,
        });
        CoercePropertyDeclaration(classDeclaration, 'data', {
          isReadonly: true,
          initializer: `toSignal(this.panelDataSource.connect({id: 'to-signal-${ name }-panel'}))`,
          scope: Scope.Public,
        });
        for (const angularImport of importList) {
          CoerceComponentImport(classDeclaration, angularImport);
        }
      },
    }),
    panelItemBackendRule(normalizedOptions),
  ]);

}