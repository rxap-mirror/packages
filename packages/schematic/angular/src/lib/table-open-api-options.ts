import { Normalized } from '@rxap/utilities';
import {
  AdapterOptions,
  NormalizeAdapterOptions,
} from './adapter-options';

export interface TableOpenApiOptions {
  operationId: string;
  adapter?: AdapterOptions;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NormalizedTableOpenApiOptions extends Readonly<Normalized<TableOpenApiOptions>> {}

export function NormalizeTableOpenApiOptions(options?: Readonly<TableOpenApiOptions>): NormalizedTableOpenApiOptions | null {
  // check if the operationId is set. The schematic options parse will build an object with all property set to undefined
  // if the user does not set the object properties. If the operationId is not set the openApi options should be null
  if (!options?.operationId) {
    return null;
  }
  return Object.seal({
    operationId: options.operationId,
    adapter: NormalizeAdapterOptions(options.adapter),
  });
}
