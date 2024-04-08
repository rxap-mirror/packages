import { MetaData } from './meta-data';

export interface Method<ReturnType = any, Parameter = any> extends MetaData {
  call(parameters?: Parameter, ...args: any[]): Promise<ReturnType> | ReturnType;
}

export interface AsyncMethod<ReturnType = any, Parameter = any> extends MetaData {
  call(parameters?: Parameter, ...args: any[]): Promise<ReturnType>;
}

export interface SyncMethod<ReturnType = any, Parameter = any> extends MetaData {
  call(parameters?: Parameter, ...args: any[]): ReturnType;
}

export interface MethodWithParameters<ReturnType = any, Parameter = any> extends Method<ReturnType, Parameter> {
  call(parameters: Parameter, ...args: any[]): Promise<ReturnType> | ReturnType;
}

export interface AsyncMethodWithParameters<ReturnType = any, Parameter = any> extends Method<ReturnType, Parameter> {
  call(parameters: Parameter, ...args: any[]): Promise<ReturnType>;
}

export interface SyncMethodWithParameters<ReturnType = any, Parameter = any> extends Method<ReturnType, Parameter> {
  call(parameters: Parameter, ...args: any[]): ReturnType;
}

export function ToMethod<ReturnType = any, Parameter = any, MethodType extends Method<ReturnType, Parameter> = Method<ReturnType, Parameter>>(call: ((
  parameters?: Parameter,
  ...args: any[]
) => Promise<ReturnType> | ReturnType), metadata: any = { id: 'to-method' }): MethodType {
  return {
    call,
    metadata,
  } as MethodType;
}
