import { NormalizedAngularOptions } from '@rxap/schematic-angular';
import {
  BuildNestControllerName,
  BuildNestControllerNameOptions,
  buildOperationId,
} from '@rxap/schematics-ts-morph';

export function BuildTreeTableGetRootOperationId(normalizedOptions: NormalizedAngularOptions & BuildNestControllerNameOptions) {
  return buildOperationId(
    normalizedOptions,
    'get-root',
    BuildNestControllerName(normalizedOptions),
  );
}