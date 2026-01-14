import { chain } from '@angular-devkit/schematics';
import { GetItemOptions } from '@rxap/schematic-angular';
import {
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import { BuildTreeTableGeChildrenOperationId } from '../../../../../lib/build-tree-table-ge-children-operation-id';
import { BuildTreeTableGetRootOperationId } from '../../../../../lib/build-tree-table-get-root-operation-id';
import { NormalizedAccordionItemTreeTableComponentOptions } from '../normalize-accordion-item-tree-table-component-options';

export function nestjsBackendRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const {
    nestModule,
    directory,
    project,
    feature,
    shared,
    scope,
    identifier,
    controllerName,
    overwrite,
    backend,
  } = normalizedOptions;
  const {
    hasSharedModifier,
  } = GetItemOptions(normalizedOptions);

  const getRootOperationId = BuildTreeTableGetRootOperationId(normalizedOptions);
  const getChildrenOperationId = BuildTreeTableGeChildrenOperationId(normalizedOptions);

  return chain([
    () => console.log(`Modify the get root operation ...`),
    CoerceGetRootOperation({
      controllerName,
      project,
      nestModule,
      overwrite,
      feature,
      shared: hasSharedModifier,
      idProperty: identifier?.property,
      skipCoerce: true,
      backend,
    }),
    () => console.log(`Modify the get children operation ...`),
    CoerceGetChildrenOperation({
      controllerName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      project,
      overwrite,
      feature,
      shared: hasSharedModifier,
      idProperty: identifier?.property,
      skipCoerce: true,
      backend,
    }),
    () => console.log(`Modify the get root proxy method ...`),
    CoerceTreeTableRootProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getRootOperationId,
      identifier,
    }),
    () => console.log(`Modify the get children proxy method ...`),
    CoerceTreeTableChildrenProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getChildrenOperationId,
      identifier,
    }),
  ]);

}