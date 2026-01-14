import {
  chain,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  BackendTypes,
  buildGetOperationId,
  CoerceAccordionComponentRule,
} from '@rxap/schematic-angular';
import {
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { NormalizedAccordionComponentOptions } from './normalize-accordion-component-options';

export function componentRule(
  normalizedOptions: NormalizedAccordionComponentOptions, hasMissingPanelComponents: boolean) {

  const {
    project,
    feature,
    directory,
    overwrite,
    itemList,
    name,
    componentName,
    backend,
  } = normalizedOptions;

  if (!componentName) {
    throw new SchematicsException(
      'The component name is required! Ensure the normalizedOptions contain the componentName property!');
  }

  let methodName: string | null = null;
  let methodModuleSpecifier: string | null = null;

  if (backend.kind === BackendTypes.NESTJS) {
    const operationId = buildGetOperationId(normalizedOptions);
    methodName = OperationIdToRemoteMethodClassName(operationId);
    methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(operationId, normalizedOptions.scope);
  }

  const templateOptions = {
    ...normalizedOptions,
    name,
    accordionName: name,
    itemList,
    exportDefault: !!feature && !directory,
    method: backend.kind === BackendTypes.NESTJS ? {
      name: methodName,
      moduleSpecifier: methodModuleSpecifier,
    } : null,
  };

  return chain([
    () => console.log('Coerce accordion component ...'),
    CoerceAccordionComponentRule({
      accordion: normalizedOptions,
      project,
      name: componentName,
      feature,
      directory,
      overwrite: overwrite || hasMissingPanelComponents,
      template: {
        options: templateOptions,
      },
    }),
  ]);

}