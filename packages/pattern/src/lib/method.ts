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

/**
 * Converts a function into a method object with associated metadata.
 *
 * This function takes a callable function and optional metadata, then wraps them into an object that conforms to the `MethodType` interface. The `MethodType` interface is expected to at least have a `call` function and a `metadata` object. This utility is useful for dynamically creating method objects that can be managed or tracked through their metadata.
 *
 * @template ReturnType The expected return type of the `call` function. Defaults to `any`.
 * @template Parameter The type of the parameter(s) that the `call` function accepts. Defaults to `any`.
 * @template MethodType The type of the method object to return. Must extend a basic structure with `call` and `metadata` properties.
 * @param call A function that takes an optional `parameters` argument and additional arguments, and returns a `Promise` or a direct value of type `ReturnType`.
 * @param metadata Optional metadata to associate with the method. Defaults to `{ id: 'to-method' }` if not provided.
 * @returns An object of type `MethodType` containing the `call` function and the `metadata`.
 */
export function ToMethod<ReturnType = any, Parameter = any, MethodType extends Method<ReturnType, Parameter> = Method<ReturnType, Parameter>>(call: ((
  parameters?: Parameter,
  ...args: any[]
) => Promise<ReturnType> | ReturnType), metadata: any = { id: 'to-method' }): MethodType {
  return {
    call,
    metadata,
  } as MethodType;
}
