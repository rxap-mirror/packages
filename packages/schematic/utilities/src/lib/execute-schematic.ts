import {
  externalSchematic,
  schematic,
} from '@angular-devkit/schematics';
import {
  clone,
  DeleteEmptyProperties,
} from '@rxap/utilities';

export function ExecuteSchematic(name: string, options: any) {
  return schematic(name, DeleteEmptyProperties(clone(options), true));
}

export function ExecuteExternalSchematic(collectionName: string, name: string, options: any) {
  return externalSchematic(collectionName, name, DeleteEmptyProperties(clone(options), true));
}
