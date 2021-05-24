import {
  Rule,
  Tree,
  FileEntry,
  SchematicsException,
} from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';

export default function (): Rule {
  return (host: Tree) => {
    host.visit((path: Path, entry?: Readonly<FileEntry> | null): void => {
      if (entry && !path.match(/\/node_modules\//)) {
        if (path.match(/\.component\.theme\.scss$/)) {
          let content = entry.content.toString('utf-8');

          content = content.replace(/@mixin\s.+(?=-theme)-/, '@mixin ');
          content = content.replace(/@mixin\s.+(?=-typography)-/, '@mixin ');

          content += '\n@mixin color($theme) {}\n';
          host.overwrite(path, content);
        }
        if (entry && path.match(/_index\.scss/)) {
          let content = entry.content.toString('utf-8');

          // region replace import with use

          const exportNameList: string[] = [];

          {
            const regex = /@import\s"(.+\/(.+)\.component\.theme)"/;

            let match = content.match(regex);

            while (match !== null) {
              if (exportNameList.includes(match[2])) {
                console.log(match);
                console.log(content);
                throw new SchematicsException(
                  `the scss export '${match[2]}' is duplicated.`
                );
              }
              content = content.replace(regex, '@use "$1" as $2');
              exportNameList.push(match[2]);
              match = content.match(regex);
            }
          }

          // endregion

          // region clear
          {
            const regex = /@mixin[^}]+}/m;

            let match = content.match(regex);

            while (match !== null) {
              content = content.replace(regex, '');
              match = content.match(regex);
            }
            content = content.replace(/^\s*\n$/m, '');
          }
          // endregion

          // region add mixin

          // region theme

          content += '@mixin theme($theme) {\n';

          for (const exportName of exportNameList) {
            content += `  @include ${exportName}.theme($theme);\n`;
          }

          content += '}\n';

          content += '@mixin color($theme) {\n';

          for (const exportName of exportNameList) {
            content += `  @include ${exportName}.color($theme);\n`;
          }

          content += '}\n';

          content += '@mixin typography($config) {\n';

          for (const exportName of exportNameList) {
            content += `  @include ${exportName}.typography($config);\n`;
          }

          content += '}\n';

          // endregion

          // endregion

          host.overwrite(path, content);
        }
      }
    });
  };
}
