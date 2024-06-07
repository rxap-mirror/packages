import {
  BuildNestControllerName as NEW_BuildNestControllerName,
  BuildNestControllerNameOptions as NEW_BuildNestControllerNameOptions
} from '@rxap/workspace-utilities';

/**
 * @deprecated import from @rxap/workspace-utilities
 */
export type BuildNestControllerNameOptions = NEW_BuildNestControllerNameOptions;

/**
 * @deprecated import from @rxap/workspace-utilities
 */
export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  return NEW_BuildNestControllerName(options);
}
