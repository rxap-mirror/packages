import {
  IsNotNull,
  IsNull,
} from './is-null';
import { RxapUtilitiesError } from './error';

export function IsDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function IsUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

export function IsUndefinedOrNull<T>(value: T | undefined | null): value is null | undefined {
  return IsUndefined(value) || IsNull(value);
}

export function IsDefinedAndNotNull<T>(value: T | null | undefined): value is T {
  return IsDefined(value) && IsNotNull(value);
}

export function AssertDefined<T>(value: T | undefined, code: string, className?: string): asserts value is T {
  if (!IsDefined(value)) {
    throw new RxapUtilitiesError('Value is not defined', code, className);
  }
}

export function AssertDefinedAndNotNull<T>(
  value: T | undefined | null,
  code: string,
  className?: string,
): asserts value is T {
  if (!IsDefined(value)) {
    throw new RxapUtilitiesError('Value is not defined or not null', code, className);
  }
}

export function IsEmpty<T>(value: T | null | undefined | ''): value is null | undefined | '' {
  return IsUndefinedOrNull(value) || value === '';
}

export function IsNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return !IsEmpty(value);
}
