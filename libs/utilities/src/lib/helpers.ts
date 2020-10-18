import { hasProperty } from './has-property';

export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

export type CssClass = string | string[] | { [ className: string ]: boolean };

export interface KeyValue<T = any> {
  [ key: string ]: T;
}

export type CssStyle = KeyValue<string> | string;

export type DisplayValue = string | number | boolean | null;

export type RecursivePartial<T> = T extends (infer I)[] ? Array<RecursivePartial<I>> :
                                  T extends object ? {
                                      [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] :
                                                       T[P] extends object ? RecursivePartial<T[P]> :
                                                       T[P]
                                    } :
                                  T;

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

export function applyContextToFunctionOrConstant<T, A extends any[]>
(functionOrConstant?: FunctionOrConstant<T, A>, args?: A, defaultValue: T | null = null): T | null {
  let value: T | undefined;
  if (typeof functionOrConstant === 'function') {
    value = (functionOrConstant as any)(...(args || []));
  } else {
    value = functionOrConstant;
  }
  return value === undefined ? defaultValue : value;
}

export type WithTableRowMeta<T> = T & IWithTableRowMeta;

export interface IWithSelected {
  __selected: boolean;
}

export interface IWithIndex {
  __index: number;
}

/**
 * @deprecated use Constructor instead
 */
export type Type<T> = new(...args: any[]) => T;

export type Constructor<T = any> = new(...args: any[]) => T;

export type Mixin<T> = Constructor<T> | object;

export interface Action {
  type: string;
}

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Identifier = 'id' | 'uuid' | '_id' | '__id' | 'key' | 'index';

export interface ControlOption<Value = any, Display = string> {
  value: Value;
  display: Display;
  disabled?: boolean;
  color?: string;
  default?: boolean;
  i18n?: boolean;
}

export type ControlOptions<Value = any, Display = string> = Array<ControlOption<Value, Display>>;

export function ToControlOptions(values: string[]): ControlOptions<string> {
  return values.map(value => ({ value, display: value }));
}

export const IDENTIFIER_PROPERTY_KEYS = [
  'id',
  'uuid',
  '_id',
  '__id',
  'key'
];

export function hasIdentifierProperty(obj: any): boolean {
  return IDENTIFIER_PROPERTY_KEYS.some(pk => hasProperty(obj, pk));
}

export function getIdentifierProperties(obj: any): string[] {
  return Object.keys(obj).filter(pk => IDENTIFIER_PROPERTY_KEYS.includes(pk));
}

export function getIdentifierPropertyValue<T = string>(obj: any): T | null {
  return obj.id || obj.uuid || obj._id || obj.__id || obj.key || obj.index || (typeof obj === 'string' && obj) || null;
}

export type WithIdentifier<IdentifierType = string> = (
  { id: IdentifierType } |
  { uuid: IdentifierType } |
  { _id: IdentifierType } |
  { __id: IdentifierType } |
  { key: IdentifierType } |
  { index: IdentifierType }
  );

export type WithChildren<T = any, Child = T> = T & { children?: Child[], hasChildren?: boolean };

export interface BaseIcon {
  inline?: boolean;
  color?: ThemePalette;
  size?: string;
  tooltip?: string;
  fontColor?: string;
}

export type ToDisplayFunction = (value: any, display?: string) => string;

export interface MaterialIcon extends BaseIcon {
  icon: string;
}

export interface SvgIcon extends BaseIcon {
  svgIcon: string;
  fontSet?: string;
  fontIcon?: string;
}

export type IconConfig = MaterialIcon | SvgIcon;

export function IsSvgIcon(icon: IconConfig): icon is SvgIcon {
  return icon.hasOwnProperty('svgIcon');
}

export function IsMaterialIcon(icon: IconConfig): icon is MaterialIcon {
  return icon.hasOwnProperty('icon');
}
