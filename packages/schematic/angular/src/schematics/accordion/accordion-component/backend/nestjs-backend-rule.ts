import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceGetByIdOperation,
  CoerceGetOperation,
} from '@rxap/schematics-ts-morph';
import { buildPropertyList } from '../build-property-list';
import { NormalizedAccordionComponentOptions } from '../normalize-accordion-component-options';
import { openApiDataSourceRule } from './open-api-data-source-rule';
import { buildGetOperationId } from '../build-get-operation-id';

export function nestjsBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    project,
    feature,
    controllerName,
    identifier,
    overwrite,
    nestModule,
    upstream,
    backend,
  } = normalizedOptions;

  const operationId = buildGetOperationId(normalizedOptions);

  const rules: Rule[] = [];

  if (identifier) {
    rules.push(
      () => console.log('Create GetById Operation ...'),
      CoerceGetByIdOperation({
        controllerName,
        project,
        feature,
        nestModule,
        overwrite,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
        idProperty: identifier.property,
        upstream,
        backend,
      }),
    );
  } else {
    rules.push(
      () => console.log('Create Get Operation ...'),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        overwrite,
        nestModule,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
        upstream,
        backend,
      }),
    );
  }

  rules.push(openApiDataSourceRule(normalizedOptions, operationId));

  return chain(rules);

}