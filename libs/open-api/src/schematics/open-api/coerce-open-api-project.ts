import {
  Rule,
  Tree,
  chain,
  externalSchematic,
  noop
} from '@angular-devkit/schematics';
import { GetAngularJson } from '@rxap/schematics-utilities';

export function CoerceOpenApiProject(project: string, prefix: string): Rule {
  return (host: Tree) => {
    const angularJson = GetAngularJson(host) as any;

    if (!angularJson.projects.hasOwnProperty(project)) {
      const defaultProjectPrefix =
              angularJson.projects[ angularJson.defaultProject ].prefix;
      return chain([
        externalSchematic('@nrwl/angular', 'library', {
          name:       project,
          importPath: `@${defaultProjectPrefix}/${project}`,
          prefix
        }),
        (tree) => {
          const baseTsconfig = JSON.parse(
            tree.read('/tsconfig.base.json')?.toString() ?? '{}'
          );

          const paths = baseTsconfig?.compilerOptions?.paths ?? {};

          if (Object.keys(paths).length) {
            for (const key of Object.keys(paths)) {
              if (key.match(/\/open-api$/)) {
                delete paths[ key ];
                paths[ key + '/*' ] = [ 'libs/open-api/src/lib/*' ];
              }
            }

            tree.overwrite(
              '/tsconfig.base.json',
              JSON.stringify(baseTsconfig, undefined, 2)
            );
          }
        }
      ]);
    }

    return noop();
  };
}
