import { ThemePalette } from '@angular/material';

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

export type Nullable<T> = T extends object ? { [key in keyof T]: Nullable<T[key]> } : T | null;

export type Diff<T, U> = T extends U ? never : T;

export type NonNullable<T> = T extends object ? { [key in keyof T]: NonNullable<T[key]> } : Diff<T, null | undefined>;

export interface IWithIdentifier {
  __id?: string;
  id?: string;
  _id?: string;
  __index?: number;
}

export function isObject(value: any): value is object {
  switch (typeof value) {

    case 'number':
    case 'bigint':
    case 'boolean':
    case 'function':
    case 'string':
    case 'symbol':
    case 'undefined':
      return false;

    case 'object':
      return value !== null && value !== undefined;

    default:
      return false;

  }
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

export function applyContextToFunctionOrConstant<T, A extends any[]>(functionOrConstant?: FunctionOrConstant<T, A>, ...args: A): T | null {
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

export type Identifier = 'id' | 'uuid' | '_id' | '__id' | 'key';

export interface ControlOption<Value, Display = string> {
  value: Value;
  display: Display;
  disabled?: boolean;
  color?: string;
}

export type ControlOptions<Value, Display = string> = Array<ControlOption<Value, Display>>;

export function hasIdentifierProperty(obj: any): boolean {
  return obj.hasOwnProperty('id') ||
         obj.hasOwnProperty('uuid') ||
         obj.hasOwnProperty('_id') ||
         obj.hasOwnProperty('__id') ||
         obj.hasOwnProperty('key');
}

export function getIdentifierPropertyValue<T = string>(obj: any): T | null {
  return obj.id || obj.uuid || obj._id || obj.__id || obj.key || null;
}

export interface IconConfig {
  svgIcon: string;
  inline?: boolean;
  fontSet?: string;
  fontIcon?: string;
  color?: ThemePalette;
}
