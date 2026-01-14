import { NormalizedAngularOptions } from '@rxap/schematic-angular';
import {
  BuildNestControllerName,
  BuildNestControllerNameOptions,
  buildOperationId,
} from '@rxap/schematics-ts-morph';

export function BuildTreeTableGeChildrenOperationId(normalizedOptions: NormalizedAngularOptions & BuildNestControllerNameOptions) {
  return buildOperationId(
    normalizedOptions,
    'get-children',
    BuildNestControllerName(normalizedOptions),
  );
}