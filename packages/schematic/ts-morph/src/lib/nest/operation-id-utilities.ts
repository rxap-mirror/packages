import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import { buildNestProjectName } from '@rxap/workspace-utilities';

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'RemoteMethod';
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToClassImportPath(operationId: string, scope?: string | null) {
  let [ id, serverId ] = operationId.split('@');
  serverId ??= 'legacy';
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/remote-methods/${ dasherize(id) }.remote-method`;
  } else {
    return `open-api-${ dasherize(serverId) }/remote-methods/${ dasherize(id) }.remote-method`;
  }
}

export function buildOperationId(options: {
  project: string,
  feature: string | null,
  shared: boolean
  backend: { project?: string | null, kind?: any } | undefined;
}, operation: string, controller: string): string {
  return `${ dasherize(controller) }-controller-${ dasherize(operation) }@${ buildNestProjectName(options) }`;
}
