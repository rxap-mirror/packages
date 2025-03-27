import { HttpResourceRequest } from '@angular/common/http';
import { Signal } from '@angular/core';

export function toHttpParams<T extends Record<string, Signal<unknown>>>(
  record: T | undefined | null,
  include: Array<keyof T> = []
): HttpResourceRequest['params'] | undefined {
  if (!record) {
    return undefined;
  }
  return Object.entries(record as Record<string, Signal<any>>)
    .filter(([key]) => include.includes(key))
    .reduce(
      (acc, [key, signal]: [string, Signal<any>]) => ({
        ...acc,
        [key]: signal(),
      }),
      {} as Record<
        string,
        string | number | boolean | ReadonlyArray<string | number | boolean>
      >
    );
}
