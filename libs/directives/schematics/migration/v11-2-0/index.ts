import {
  Rule,
  Tree,
  FileEntry
} from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';


export default function(): Rule {

  return (host: Tree) => {

    host.visit((path: Path, entry?: Readonly<FileEntry> | null): void => {

      if (entry && path.match(/\.ts$/) && !path.match(/\/node_modules\//)) {

        const content = entry.content.toString('utf-8');
        {
          const regex = /from '@rxap\/directives\/material([^']+)'/g;
          const match = content.match(regex);

          if (match) {
            const newContent = content.replace(regex, 'from \'@rxap/material-directives$1\'');
            host.overwrite(path, newContent);
          }
        }
        {
          const regex = /from '@rxap\/directives\/form-field-no-padding'/g;
          const match = content.match(regex);

          if (match) {
            const newContent = content.replace(regex, 'from \'@rxap/material-directives/form-field\'');
            host.overwrite(path, newContent);
          }
        }

      }

    });

  };

}
