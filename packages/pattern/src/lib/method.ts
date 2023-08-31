import { MetaData } from './meta-data';

export interface Method<ReturnType = any, Parameter = any> extends MetaData {
  call(parameters?: Parameter, ...args: any[]): Promise<ReturnType> | ReturnType;
}

export function ToMethod<ReturnType = any, Parameter = any>(call: ((
  parameters?: Parameter,
  ...args: any[]
) => Promise<ReturnType> | ReturnType), metadata: any = { id: 'to-method' }): Method<ReturnType, Parameter> {
  return {
    call,
    metadata,
  };
}
