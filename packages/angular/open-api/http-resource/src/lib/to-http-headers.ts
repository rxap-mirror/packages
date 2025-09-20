import { HttpResourceRequest } from '@angular/common/http';
import { Signal } from '@angular/core';

export function toHttpHeaders<T extends Record<string, Signal<unknown>>>(
  record: T | undefined | null,
  include: Array<keyof T> = []
): HttpResourceRequest['headers'] | undefined {
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
        string | ReadonlyArray<string>
      >
    );
}
