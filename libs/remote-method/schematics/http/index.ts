import {
  Rule,
  Tree,
  chain,
  mergeWith,
  apply,
  url,
  applyTemplates,
  move
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { HttpSchema } from './schema';

export default function(options: HttpSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[0] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(options.path)
      ]))
    ]);

  };

}
