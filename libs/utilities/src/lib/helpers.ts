export type CssClass = string | string[] | { [ className: string ]: boolean };

export interface KeyValue<T = any> {
  [ key: string ]: T;
}

export type CssStyle = KeyValue<string>;

export type DisplayValue = string | number | boolean | null;

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export type WithSelected<T> = { __selected: boolean } & T;

export type RowId = number | string;

export type WithIndex<T> = { __index: number } & T;

export interface IWithIdentifier {
  __id?: string;
  id?: string;
  _id?: string;
  __index?: number;
}

export type WithIdentifier<T> = IWithIdentifier & { __index: number } & T;

export type DefaultTemplateNames =
  | 'transformer'
  | 'object'
  | 'array'
  | 'relationArray'
  | 'relation'
  | 'asyncValue'
  | 'asyncArray'
  | 'plain';

export interface IWithTableRowMeta {
  __edit?: boolean;
  __remove?: boolean;
  __archive?: boolean;
  __expand?: boolean;
  __view?: boolean;
  __classes?: string | string[] | KeyValue;
  __styles?: KeyValue;
}

export type FunctionOrConstant<T, A extends any[]> = T | ((...args: A) => T);

export function applyContextToFunctionOrConstant<T, A extends any[]>(functionOrConstant?: FunctionOrConstant<T, A>, ...args: A): T {
  if (typeof functionOrConstant === 'function') {
    return (functionOrConstant as any)(...args) || null;
  }
  return functionOrConstant === undefined ? null : functionOrConstant;
}

export type WithTableRowMeta<T> = T & IWithTableRowMeta;

export interface IWithSelected {
  __selected: boolean;
}

export interface IWithIndex {
  __index: number;
}

export interface Type<T> extends Function {
  new(...args: any[]): T;
}

export interface Action {
  type: string;
}

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
