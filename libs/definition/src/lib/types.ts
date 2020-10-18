import {
  Type,
  InjectionToken,
  AbstractType
} from '@angular/core';

export type IdOrInstanceOrToken<T> = string | T | Type<T> | InjectionToken<T> | AbstractType<T>;
