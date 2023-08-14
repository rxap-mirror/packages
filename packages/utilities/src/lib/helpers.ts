import { hasProperty } from './has-property';

export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

export type CssClass = string | string[] | { [className: string]: boolean };

export type KeyValue<T = any> = Record<string, T>

export type CssStyle = KeyValue<string> | string;

export type DisplayValue = string | number | boolean | null;

export type RecursivePartial<T> = T extends (infer I)[] ? Array<RecursivePartial<I>> :
  T extends object ? {
      [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] :
        T[P] extends object ? RecursivePartial<T[P]> :
          T[P]
    } :
    T;

export type RecursiveReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer R)[] ? ReadonlyArray<RecursiveReadonly<R>> :
    T[K] extends (...args: any[]) => any ? T[K] :
      T[K] extends object ? RecursiveReadonly<T[K]> :
        T[K];
}

export type WithSelected<T> = { __selected: boolean } & T;

export type RowId = number | string;

export type WithIndex<T> = { __index: number } & T;

// export type Nullable<T> = T extends object ? { [key in keyof T]: Nullable<T[key]> } : T | null;

export type Diff<T, U> = T extends U ? never : T;

export type NonNullable<T> = T extends object ? { [key in keyof T]: NonNullable<T[key]> } : Diff<T, null | undefined>;

export type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object | null ? (T[K] extends Array<any> ? never : K) : never
}[keyof T];

export type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K
}[keyof T];

export type OptionalKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never
}[keyof T];

export type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends Array<any> ? K : never
}[keyof T]

export type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T];

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

export type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

export type PickObject<T> = Pick<T, ObjectKeys<T>>;

export type PickRequired<T> = Pick<T, RequiredKeys<T>>;

export type PickOptional<T> = Pick<T, OptionalKeys<T>>;

export type PickBoolean<T> = Pick<T, BooleanKeys<Required<T>>>;

export type PickString<T> = Pick<T, StringKeys<Required<T>>>;

export type PickNumber<T> = Pick<T, NumberKeys<Required<T>>>;

export type PickArray<T> = Pick<T, ArrayKeys<T>>;

export type Nullable<T> = { [P in keyof T]-?: T[P] | null };

export type NonString<T> = T extends string ? never : T;

export type NotOnlyString<T> = [ T ] extends [ string | null ] ? T : NonString<T>;

export type NonNull<T> = Diff<T, null>;

export type NonUndefined<T> = Diff<T, undefined>;

export type NonEmpty<T> = NonNull<T> & NonUndefined<T>;

export type RemoveStringInUnions<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<NotOnlyString<U>>
    : NotOnlyString<T[K]>
};

export type RecursiveNormalize<T> = {
  [K in keyof T]: T[K] extends (infer U)[]
    ? Normalized<U>[]
    : T[K] extends object
      ? Normalized<T[K]>
      : T[K] extends object | null ? Normalized<NonNull<T[K]>> | null : T[K]
};

export type NormalizeObject<T> =
  RecursiveNormalize<
    PickObject<RemoveStringInUnions<PickRequired<T>>> &
    PickObject<RemoveStringInUnions<Nullable<PickOptional<T>>>>
  >

export type NormalizeArray<T> =
  RecursiveNormalize<
    PickArray<RemoveStringInUnions<PickRequired<T>>> &
    PickArray<RemoveStringInUnions<Required<PickOptional<T>>>>
  >

export type NormalizeBoolean<T> = Required<PickBoolean<T>>;

export type NormalizeString<T> = PickString<PickRequired<T>> & Nullable<PickString<PickOptional<T>>>;

export type NormalizeNumber<T> = PickNumber<PickRequired<T>> & Nullable<PickNumber<PickOptional<T>>>;

export type Normalized<T> = T extends object ?
  NormalizeObject<T>
  & NormalizeArray<T>
  & NormalizeBoolean<T>
  & NormalizeString<T>
  & NormalizeNumber<T> :
  T;

export type RequiredSelected<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullableSelected<T, K extends keyof T> = T & NonNullable<Pick<T, K>>;

export interface IWithIdentifier {
  __id?: string;
  id?: string;
  _id?: string;
  __index?: number;
}

/**
 * This function checks if a given value is an object.
 *
 * @export
 * @function isObject
 * @param {any} value - The value to be checked.
 * @returns {boolean} - Returns true if the value is an object (excluding arrays, functions, and null), otherwise returns false.
 *
 * @description
 * The function uses the JavaScript `typeof` operator to determine the type of the input value. It checks against a number of primitive types (number, bigint, boolean, function, string, symbol, undefined) and returns false if the value is of any of these types.
 * If the value is of type 'object', the function further checks if the value is not null, not undefined, and not an array. If all these conditions are met, the function returns true, indicating that the value is indeed an object.
 * For any other type not covered by the above cases, the function returns false.
 *
 * Note: This function uses TypeScript's type guard syntax (`value is object`) in its return type. This means that if the function returns true, TypeScript will treat the value as an object in the subsequent code.
 */
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
      return value !== null && value !== undefined && !Array.isArray(value);

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

/**
 * This function applies a given context to a function or a constant. If the provided argument is a function, it will be invoked with the provided arguments. If it's a constant, the constant itself will be returned. If the function or constant is not defined or returns undefined, a default value will be returned instead.
 *
 * @template T - The type of the return value of the function or the type of the constant.
 * @template A - The type of the array of arguments that the function can accept.
 *
 * @param {FunctionOrConstant<T, A>} [functionOrConstant] - The function or constant to which the context should be applied. This parameter is optional.
 * @param {A} [args] - An array of arguments to be passed to the function if the first parameter is a function. This parameter is optional.
 * @param {T | null} [defaultValue=null] - The default value to be returned if the function or constant is not defined or returns undefined. This parameter is optional and defaults to null.
 *
 * @returns {T | null} - The result of the function invocation or the constant itself, or the default value if the function or constant is not defined or returns undefined.
 *
 * @example
 * // If functionOrConstant is a function:
 * applyContextToFunctionOrConstant((x, y) => x + y, [1, 2], 0); // Returns 3
 * // If functionOrConstant is a constant:
 * applyContextToFunctionOrConstant(5, null, 0); // Returns 5
 * // If functionOrConstant is undefined:
 * applyContextToFunctionOrConstant(undefined, null, 0); // Returns 0
 */
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
  i18n?: string;
}

export type ControlOptions<Value = any, Display = string> = Array<ControlOption<Value, Display>>;

/**
 * Converts an array of strings into an array of ControlOptions objects.
 * Each ControlOptions object consists of two properties: 'value' and 'display'.
 * Both properties are assigned the same string value from the input array.
 *
 * @export
 * @function ToControlOptions
 * @param {string[]} values - An array of strings to be converted into ControlOptions objects.
 * @returns {ControlOptions<string>[]} - An array of ControlOptions objects. Each object has 'value' and 'display' properties, both assigned the same string value from the input array.
 *
 * @example
 * // returns [{value: 'example1', display: 'example1'}, {value: 'example2', display: 'example2'}]
 * ToControlOptions(['example1', 'example2']);
 *
 * @see ControlOptions
 */
export function ToControlOptions(values: string[]): ControlOptions<string> {
  return values.map(value => ({
    value,
    display: value,
  }));
}

export const IDENTIFIER_PROPERTY_KEYS = [
  'id',
  'uuid',
  '_id',
  '__id',
  'key',
];

/**
 * Checks if the provided object has any of the properties defined in the IDENTIFIER_PROPERTY_KEYS array.
 *
 * @export
 * @function hasIdentifierProperty
 * @param {any} obj - The object to be checked for identifier properties. This can be of any type.
 * @returns {boolean} - Returns true if the object has at least one property that matches a key in the IDENTIFIER_PROPERTY_KEYS array. Otherwise, it returns false.
 *
 * @example
 * // Assuming IDENTIFIER_PROPERTY_KEYS = ['id', 'key', 'identifier']
 * let obj = { id: 1, name: 'John Doe' };
 * console.log(hasIdentifierProperty(obj)); // Outputs: true
 *
 * @example
 * let obj = { name: 'John Doe' };
 * console.log(hasIdentifierProperty(obj)); // Outputs: false
 *
 * @note The function uses the 'some' method of the Array prototype, which tests whether at least one element in the array passes the test implemented by the provided function.
 * @note The function uses the 'hasProperty' function to check if the object has a property. The 'hasProperty' function is not defined in this documentation.
 */
export function hasIdentifierProperty(obj: any): boolean {
  return IDENTIFIER_PROPERTY_KEYS.some(pk => hasProperty(obj, pk));
}

/**
 * This function retrieves the identifier properties from a given object.
 *
 * @export
 * @function getIdentifierProperties
 * @param {any} obj - The object from which to extract identifier properties. This can be of any type that is an object (e.g., Array, Function, Object, Date, null).
 * @returns {string[]} - An array of strings representing the keys of the identifier properties found in the input object. If no identifier properties are found, an empty array is returned.
 *
 * @description
 * This function uses the `Object.keys()` method to get an array of the object's own enumerable property names, iterated in the same order that a normal loop would. It then filters this array to only include keys that are also present in the `IDENTIFIER_PROPERTY_KEYS` array.
 *
 * Note: The `IDENTIFIER_PROPERTY_KEYS` array is not defined within this function, and must be available in the scope where this function is called.
 *
 * This function does not modify the input object.
 */
export function getIdentifierProperties(obj: any): string[] {
  return Object.keys(obj).filter(pk => IDENTIFIER_PROPERTY_KEYS.includes(pk));
}

/**
 * This function is used to retrieve the identifier property value from an object. The identifier property can be one of the following: 'id', 'uuid', '_id', '__id', 'key', or 'index'. If the object is a string, the function will return the string itself. If none of these properties exist, the function will return null.
 *
 * @template T - The type of the identifier property value. By default, it is a string.
 *
 * @param {any} obj - The object from which to retrieve the identifier property value. This can be of any type, but typically it would be an object or a string.
 *
 * @returns {T | null} - The value of the identifier property if it exists, otherwise null. If the object is a string, the function will return the string itself. The return type will be of type T, or null if no identifier property exists.
 *
 * @example
 * // returns '123'
 * getIdentifierPropertyValue<{id: '123'}>({id: '123'});
 *
 * @example
 * // returns 'abc'
 * getIdentifierPropertyValue('abc');
 *
 * @example
 * // returns null
 * getIdentifierPropertyValue({});
 */
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

/**
 * This function checks if the provided icon is of type SvgIcon.
 *
 * @export
 * @function IsSvgIcon
 * @param {IconConfig} [icon] - An optional parameter that represents the icon configuration.
 * @returns {boolean} - The function returns a boolean value. If the icon is of type SvgIcon, it returns true. Otherwise, it returns false.
 *
 * The function works by first checking if the icon is not undefined. If the icon is undefined, it immediately returns false.
 * If the icon is defined, it then checks if the 'svgIcon' property exists on the icon object. If the 'svgIcon' property exists, it returns true, indicating that the icon is of type SvgIcon.
 * If the 'svgIcon' property does not exist, it returns false, indicating that the icon is not of type SvgIcon.
 *
 * @example
 *
 * let icon1 = { svgIcon: 'home' };
 * let icon2 = { pngIcon: 'home' };
 *
 * console.log(IsSvgIcon(icon1)); // Outputs: true
 * console.log(IsSvgIcon(icon2)); // Outputs: false
 *
 * @see {@link IconConfig} for more information about the icon configuration object.
 * @see {@link SvgIcon} for more information about the SvgIcon type.
 */
export function IsSvgIcon(icon?: IconConfig): icon is SvgIcon {
  return icon !== undefined && (icon as any)['svgIcon'] !== undefined;
}

/**
 * This function checks if the provided icon is a MaterialIcon.
 *
 * @export
 * @function IsMaterialIcon
 * @param {IconConfig} [icon] - An optional parameter that represents the icon configuration.
 * @returns {boolean} - Returns true if the provided icon is a MaterialIcon, otherwise returns false.
 *
 * The function works by checking if the icon parameter is not undefined and if the 'icon' property of the icon parameter is not undefined.
 * If both conditions are met, it means that the icon is a MaterialIcon, so the function returns true.
 * If any of the conditions is not met, it means that the icon is not a MaterialIcon, so the function returns false.
 *
 * @example
 *
 * IsMaterialIcon({icon: 'home', color: 'primary'}); // returns true
 * IsMaterialIcon(); // returns false
 * IsMaterialIcon({color: 'primary'}); // returns false
 */
export function IsMaterialIcon(icon?: IconConfig): icon is MaterialIcon {
  return icon !== undefined && (icon as any)['icon'] !== undefined;
}
