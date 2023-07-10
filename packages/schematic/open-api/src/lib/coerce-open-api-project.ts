import {
  chain,
  externalSchematic,
  noop,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { GetAngularJson } from '@rxap/schematics-utilities';

export function CoerceOpenApiProject(project: string, prefix: string, directory?: string): Rule {
  return (host: Tree) => {
    const angularJson = GetAngularJson(host) as any;

    const projectName = `${ directory ? directory.split('/').join('-') + '-' : '' }${ project }`;

    if (!angularJson.projects[projectName]) {
      const defaultProject = angularJson.projects[angularJson.defaultProject];
      const defaultProjectPrefix = prefix ?? defaultProject.prefix;
      return chain([
        externalSchematic('@nrwl/angular', 'library', {
          name: project,
          importPath: `@${ defaultProjectPrefix }/${ projectName }`,
          prefix,
          directory,
        }),
        (tree) => {
          const baseTsconfig = JSON.parse(
            tree.read('/tsconfig.base.json')?.toString() ?? '{}',
          );

          const paths = baseTsconfig?.compilerOptions?.paths ?? {};

          if (Object.keys(paths).length) {
            for (const key of Object.keys(paths)) {
              if (directory) {
                if (key.match(new RegExp(`/${ directory.split('/').join('-') }-${ project }$`))) {
                  delete paths[key];
                  paths[key + '/*'] = [ `libs/${ directory }/${ project }/src/lib/*` ];
                }
              } else {
                if (key.match(new RegExp(`/${ project }$`))) {
                  delete paths[key];
                  paths[key + '/*'] = [ `libs/${ project }/src/lib/*` ];
                }
              }
            }

            tree.overwrite(
              '/tsconfig.base.json',
              JSON.stringify(baseTsconfig, undefined, 2),
            );
          }
        },
      ]);
    }

    return noop();
  };
}
