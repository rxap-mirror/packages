import {
  classify,
  dasherize,
} from '@rxap/utilities';


export function OperationIdToRemoteMethodClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'RemoteMethod';
}

export function OperationIdToCommandClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Command';
}


export function OperationIdToResponseClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Response';
}

export function OperationIdToParameterClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'Parameter';
}

export function OperationIdToClassRemoteMethodImportPath(operationId: string, scope?: string | null) {
  const [ id, serverId = 'legacy' ] = operationId.split('@');
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/remote-methods/${ dasherize(id) }.remote-method`;
  } else {
    return `open-api-${ dasherize(serverId) }/remote-methods/${ dasherize(id) }.remote-method`;
  }
}

export function OperationIdToRequestBodyClassName(operationId: string) {
  const [ id ] = operationId.split('@');
  return classify(id) + 'RequestBody';
}

export function OperationIdToCommandClassImportPath(operationId: string, scope?: string | null) {
  const [ id, serverId = 'legacy' ] = operationId.split('@');
  if (scope) {
    return `${ scope }/service-open-api-${ dasherize(serverId) }/commands/${ dasherize(id) }.command`;
  } else {
    return `service-open-api-${ dasherize(serverId) }/commands/${ dasherize(id) }.command`;
  }
}

export function OpenApiResponseClassImportPath(response: string, serverId: string, scope?: string | null) {
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/responses/${ dasherize(response)
      .replace('-response', '') }.response`;
  } else {
    return `open-api-${ dasherize(serverId) }/responses/${ dasherize(response)
      .replace('-response', '') }.response`;
  }
}

export function OperationIdToResponseClassImportPath(operationId: string, scope?: string | null) {
  const [ id, serverId = 'legacy' ] = operationId.split('@');
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/responses/${ dasherize(id) }.response`;
  } else {
    return `open-api-${ dasherize(serverId) }/responses/${ dasherize(id) }.response`;
  }
}

export function OperationIdToParameterClassImportPath(operationId: string, scope?: string | null) {
  const [ id, serverId = 'legacy' ] = operationId.split('@');
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/parameters/${ dasherize(id) }.parameter`;
  } else {
    return `open-api-${ dasherize(serverId) }/parameters/${ dasherize(id) }.parameter`;
  }
}

export function OperationIdToRequestBodyClassImportPath(operationId: string, scope?: string | null) {
  const [ id, serverId = 'legacy' ] = operationId.split('@');
  if (scope) {
    return `${ scope }/open-api-${ dasherize(serverId) }/request-bodies/${ dasherize(id) }.request-body`;
  } else {
    return `open-api-${ dasherize(serverId) }/request-bodies/${ dasherize(id) }.request-body`;
  }
}
