import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from './type-import';

export interface AdapterOptions extends TypeImport {
  /**
   * @deprecated use name instead
   */
  className: string;
  /**
   * @deprecated use moduleSpecifier instead
   */
  importPath: string;
}

export type NormalizedAdapterOptions = NormalizedTypeImport;

export function NormalizeAdapterOptions(options?: AdapterOptions): NormalizedAdapterOptions | null {
  if (options) {
    options.name ??= options.className;
    options.moduleSpecifier ??= options.importPath;
  }
  // check if the className and importPath is set. The schematic options parse will build an object with all property set to undefined
  // if the user does not set the object properties. If the className or importPath is not set the adapter options should be null
  if (!options || !options.name) {
    return null;
  }
  return NormalizeTypeImport(options);
}
