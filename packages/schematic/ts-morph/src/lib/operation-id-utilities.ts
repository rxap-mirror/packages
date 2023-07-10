import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import { buildNestProjectName } from './nest/project-utilities';

export function OperationIdToClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'RemoteMethod';
}

export function ServiceOperationIdToClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Command';
}


export function OperationIdToResponseClassName(operationId: string) {
  const [id] = operationId.split('@');
  return classify(id) + 'Response';
}

export function OperationIdToParameterClassName(operationId: string) {
  const [id] = operationId.split('@');
  return classify(id) + 'Parameter';
}

export function OperationIdToClassImportPath(operationId: string) {
  let [id, serverId] = operationId.split('@');
  serverId ??= 'legacy';
  return `@eurogard/open-api-${dasherize(serverId)}/remote-methods/${dasherize(id)}.remote-method`;
}

export function ServiceOperationIdToClassImportPath(operationId: string) {
  let [id, serverId] = operationId.split('@');
  serverId ??= 'legacy';
  return `@eurogard/service-open-api-${dasherize(serverId)}/commands/${dasherize(id)}.command`;
}

export function OpenApiResponseClassImportPath(response: string, serverId = 'legacy') {
  return `@eurogard/open-api-${dasherize(serverId)}/responses/${dasherize(response)
    .replace('-response', '')}.response`;
}

export function OperationIdToResponseClassImportPath(operationId: string) {
  let [id, serverId] = operationId.split('@');
  serverId ??= 'legacy';
  return `@eurogard/open-api-${dasherize(serverId)}/responses/${dasherize(id)}.response`;
}

export function OperationIdToParameterClassImportPath(operationId: string) {
  let [id, serverId] = operationId.split('@');
  serverId ??= 'legacy';
  return `@eurogard/open-api-${dasherize(serverId)}/parameters/${dasherize(id)}.parameter`;
}

export function buildOperationId(options: {
  project: string,
  feature: string,
  shared: boolean
}, operation: string, controller: string): string {
  return `${dasherize(controller)}-controller-${dasherize(operation)}@${buildNestProjectName(options)}`;
}
