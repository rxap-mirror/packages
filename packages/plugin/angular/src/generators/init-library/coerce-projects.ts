import { libraryGenerator as angularLibraryGenerator } from '@nx/angular/generators';
import { Schema as AngularLibraryGeneratorSchema } from '@nx/angular/src/generators/library/schema';
import { Tree } from '@nx/devkit';
import { FixDependencies } from '@rxap/plugin-library';
import {
  GetDefaultGeneratorOptions,
  GetProject,
  GetProjectSourceRoot,
  GetWorkspaceScope,
  HasProject,
  UpdateProjectPackageJson,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { cleanup } from './cleanup';
import { InitLibraryGeneratorSchema } from './schema';

export async function coerceProjects(tree: Tree, options: InitLibraryGeneratorSchema) {


  const defaultOptions = GetDefaultGeneratorOptions<Partial<AngularLibraryGeneratorSchema>>(
    tree, '@nx/angular:library');
  const tags = (
    defaultOptions.tags ?? ''
  ).split(',').map(tag => tag.trim());
  tags.push('angular');
  tags.push('ngx');
  defaultOptions.projectNameAndRootFormat = 'as-provided';
  defaultOptions.publishable ??= false;
  defaultOptions.buildable ??= false;
  defaultOptions.skipFormat ??= false;
  defaultOptions.simpleName ??= false;
  defaultOptions.addModuleSpec ??= false;
  defaultOptions.skipPackageJson ??= false;
  defaultOptions.skipPackageJson ??= false;
  defaultOptions.routing ??= false;
  defaultOptions.lazy ??= false;
  defaultOptions.unitTestRunner ??= 'jest' as any;
  defaultOptions.strict ??= true;
  defaultOptions.linter ??= 'eslint' as any;
  defaultOptions.standaloneConfig ??= true;
  defaultOptions.setParserOptionsProject ??= false;
  defaultOptions.addTailwind ??= false;
  defaultOptions.skipModule ??= false;
  defaultOptions.standalone ??= true;
  defaultOptions.displayBlock ??= false;
  defaultOptions.inlineStyle ??= false;
  defaultOptions.inlineTemplate ??= false;
  defaultOptions.changeDetection ??= 'OnPush';
  defaultOptions.style ??= 'scss';
  defaultOptions.skipTests ??= false;
  defaultOptions.skipSelector ??= false;
  defaultOptions.flat ??= false;

  const scope = GetWorkspaceScope(tree);

  for (const projectName of options.projects ?? []) {

    if (!HasProject(tree, projectName)) {

      let directory = projectName;
      let customOptions: Partial<AngularLibraryGeneratorSchema> = {};
      if (typeof options.coerce === 'object') {
        customOptions = options.coerce;
        if (options.coerce.directory) {
          if (options.projects?.length === 1) {
            directory = options.coerce.directory;
          } else {
            directory = join(options.coerce.directory, projectName);
          }
        }
      }

      const importPath = `${ scope }/${ projectName }`;

      const schema: AngularLibraryGeneratorSchema = {
        ...defaultOptions,
        ...customOptions,
        directory,
        importPath,
        name: projectName,
        tags: tags.join(','),
      };

      await angularLibraryGenerator(tree, schema);

      if (!options.indexExport) {
        UpdateTsConfigJson(tree, tsConfig => {
          tsConfig.compilerOptions ??= {};
          tsConfig.compilerOptions.paths ??= {};
          if (tsConfig.compilerOptions.paths[importPath]) {
            delete tsConfig.compilerOptions.paths[importPath];
          }
          tsConfig.compilerOptions.paths[`${ importPath }/*`] = [
            `${ GetProjectSourceRoot(
              tree, projectName) }/lib/*`,
          ];
        }, { infix: 'base' });
      }

      if (defaultOptions.buildable && !defaultOptions.publishable) {
        UpdateProjectPackageJson(tree, packageJson => {
          packageJson.private = true;
        }, { projectName });
      }

      cleanup(tree, GetProject(tree, projectName), projectName);

      if (defaultOptions.buildable || defaultOptions.publishable) {
        await FixDependencies(tree, { projects: [ projectName ] });
      }

    }

  }

}
