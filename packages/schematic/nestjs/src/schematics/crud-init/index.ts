import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { ExecuteExternalSchematic } from '@rxap/schematics-utilities';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { CrudInitSchema } from './schema';

export default function (options: CrudInitSchema): Rule {

  return chain([
    ExecuteExternalSchematic('@nrwl/nest', 'library', { name: options.project, importPath: options.importPath }),
    tree => tree.create(`${GetProjectSourceRoot(tree, options.project)}/db.yaml`, 'collections: []'),
  ]);

}
