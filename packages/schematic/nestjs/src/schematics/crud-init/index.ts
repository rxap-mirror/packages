import { CrudInitSchema } from './schema';
import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { ExecuteExternalSchematic } from '@rxap/schematics-utilities';

const { dasherize } = strings;

export default function (options: CrudInitSchema): Rule {

  return chain([
    ExecuteExternalSchematic('@nrwl/nest', 'library', { name: options.project, importPath: options.importPath }),
    tree => tree.create(`libs/${ dasherize(options.project) }/src/db.yaml`, 'collections: []'),
  ]);

}
