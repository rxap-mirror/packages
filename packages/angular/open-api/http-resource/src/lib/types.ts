import { Signal } from '@angular/core';

/**
 * Converts all properties of type T to Signal<T[K]>
 */
export type SignalProperties<T> = {
  [K in keyof T]: Signal<T[K] | null>;
};

export interface OpenApiHttpResourceOptions<
  Parameters extends Record<string, any> | void = any,
  RequestBody = any
> {
  parameters?: SignalProperties<Parameters>;
  requestBody?: Signal<RequestBody>;
}
