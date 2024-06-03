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
export function ServiceOperationIdToClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Command';
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToResponseClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Response';
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToParameterClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Parameter';
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

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToRequestBodyClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'RequestBody';
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function ServiceOperationIdToClassImportPath(operationId: string, scope?: string | null) {
  let [ id, serverId ] = operationId.split('@');
  serverId ??= 'legacy';
  if (scope) {
    return `${ scope }/service-open-api-${ dasherize(serverId) }/commands/${ dasherize(id) }.command`;
  } else {
    return `service-open-api-${ dasherize(serverId) }/commands/${ dasherize(id) }.command`;
  }
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OpenApiResponseClassImportPath(response: string, serverId: string, scope?: string | null) {
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/responses/${ dasherize(response)
      .replace('-response', '') }.response`;
  } else {
    return `open-api-${ dasherize(serverId) }/responses/${ dasherize(response)
      .replace('-response', '') }.response`;
  }
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToResponseClassImportPath(operationId: string, scope?: string | null) {
  let [ id, serverId ] = operationId.split('@');
  serverId ??= 'legacy';
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/responses/${ dasherize(id) }.response`;
  } else {
    return `open-api-${ dasherize(serverId) }/responses/${ dasherize(id) }.response`;
  }
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToParameterClassImportPath(operationId: string, scope?: string | null) {
  let [ id, serverId ] = operationId.split('@');
  serverId ??= 'legacy';
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/parameters/${ dasherize(id) }.parameter`;
  } else {
    return `open-api-${ dasherize(serverId) }/parameters/${ dasherize(id) }.parameter`;
  }
}

/**
 * @deprecated import from @rxap/ts-morph instead
 */
export function OperationIdToRequestBodyClassImportPath(operationId: string, scope?: string | null) {
  let [ id, serverId ] = operationId.split('@');
  serverId ??= 'legacy';
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/request-bodies/${ dasherize(id) }.request-body`;
  } else {
    return `open-api-${ dasherize(serverId) }/request-bodies/${ dasherize(id) }.request-body`;
  }
}

export function buildOperationId(options: {
  project: string,
  feature: string | null,
  shared: boolean
}, operation: string, controller: string): string {
  return `${ dasherize(controller) }-controller-${ dasherize(operation) }@${ buildNestProjectName(options) }`;
}
