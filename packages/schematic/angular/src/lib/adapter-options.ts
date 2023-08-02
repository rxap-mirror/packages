import { Normalized } from '@rxap/utilities';

export interface AdapterOptions {
  className: string;
  importPath: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NormalizedAdapterOptions extends Readonly<Normalized<AdapterOptions>> {}

export function NormalizeAdapterOptions(options?: Readonly<AdapterOptions>): NormalizedAdapterOptions | null {
  // check if the className and importPath is set. The schematic options parse will build an object with all property set to undefined
  // if the user does not set the object properties. If the className or importPath is not set the adapter options should be null
  if (!options?.className || !options?.importPath) {
    return null;
  }
  return Object.seal({
    className: options.className,
    importPath: options.importPath,
  });
}
