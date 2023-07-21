import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { HasComponent } from './has-component';
import { BuildAngularBasePath } from './build-angular-base-path';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import {
  classify,
  CoerceFile,
  dasherize,
  GetProjectPrefix,
} from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';

export interface TemplateOptions {
  url?: string,
  options?: Record<string, unknown> | object,
}

export interface CoerceComponentOptions {
  project: string;
  feature: string;
  shared?: boolean;
  directory?: string;
  name: string;
  flat?: boolean;
  template?: TemplateOptions;
  overwrite?: boolean;
  tsMorphTransform?: (
    project: Project,
    [ componentSourceFile, moduleSourceFile ]: [ SourceFile, SourceFile ],
    [ componentClass, moduleClass ]: [ ClassDeclaration, ClassDeclaration ],
    options: CoerceComponentOptions,
  ) => void;
}

export function CoerceComponentRule(options: Readonly<CoerceComponentOptions>): Rule {
  let {
    tsMorphTransform,
    template,
    project,
    feature,
    directory,
    name,
    flat,
    overwrite,
  } = options;
  overwrite ??= false;
  directory ??= '';
  flat ??= directory.endsWith(name);
  return tree => {

    const basePath = BuildAngularBasePath(tree, options);

    const rules: Rule[] = [];

    if (!HasComponent(tree, options)) {
      rules.push(() => console.log(`Project '${ project }' does not have a component '${ name }' in the feature '${ feature }' in the directory '${ directory }', New component will be created.`));
      if (tsMorphTransform) {
        console.log('Create component with ts-morph');
        const prefix = GetProjectPrefix(tree, options.project);
        const componentPath = flat ? '' : name;
        rules.push(TsMorphAngularProjectTransform(
          options,
          (project) => {

            const componentSourceFile = project.createSourceFile(join(componentPath, `${ name }.component.ts`), '');
            const moduleSourceFile = project.createSourceFile(
              join(componentPath, `${ name }.component.module.ts`),
              '',
            );

            const componentClass = componentSourceFile.addClass({
              isExported: true,
              name: `${ classify(name) }Component`,
              decorators: [
                {
                  name: 'Component',
                  arguments: [
                    Writers.object({
                      selector: w => w.quote(`${ prefix }-${ dasherize(name) }`),
                      templateUrl: w => w.quote(`./${ name }.component.html`),
                      styleUrls: w => w.write('[').quote(`./${ name }.component.scss`).write(']'),
                      changeDetection: 'ChangeDetectionStrategy.OnPush',
                    }),
                  ],
                },
              ],
            });
            componentSourceFile.addImportDeclarations([
              {
                moduleSpecifier: '@angular/core',
                namedImports: [ 'Component', 'ChangeDetectionStrategy' ],
              },
            ]);

            const moduleClass = moduleSourceFile.addClass({
              isExported: true,
              name: `${ classify(name) }ComponentModule`,
              decorators: [
                {
                  name: 'NgModule',
                  arguments: [
                    Writers.object({
                      declarations: `[${ classify(name) }Component]`,
                      exports: `[${ classify(name) }Component]`,
                    }),
                  ],
                },
              ],
            });
            moduleSourceFile.addImportDeclarations([
              {
                moduleSpecifier: `./${ name }.component`,
                namedImports: [ classify(name) + 'Component' ],
              },
              {
                moduleSpecifier: '@angular/core',
                namedImports: [ 'NgModule' ],
              },
            ]);

            tsMorphTransform(
              project,
              [ componentSourceFile, moduleSourceFile ],
              [ componentClass, moduleClass ],
              options,
            );
          },
          [],
        ));
        rules.push(tree => {
          CoerceFile(tree, join(basePath, componentPath, `${ name }.component.html`), '');
          CoerceFile(tree, join(basePath, componentPath, `${ name }.component.scss`), '');
        });
      } else {
        console.log('Create component with external schematic');
        rules.push(externalSchematic('@rxap/schematics', 'component-module', {
          project,
          name,
          skipTests: true,
          theme: false,
          stories: false,
          path: basePath,
          flat,
        }));
      }
    } else if (tsMorphTransform) {
      const componentPath = flat ? '' : name;
      rules.push(TsMorphAngularProjectTransform(
        options,
        (project, [ componentSourceFile, moduleSourceFile ]) => {
          const componentClass = componentSourceFile.getClassOrThrow(`${ classify(name) }Component`);
          const moduleClass = moduleSourceFile.getClassOrThrow(`${ classify(name) }ComponentModule`);
          tsMorphTransform(
            project,
            [ componentSourceFile, moduleSourceFile ],
            [ componentClass, moduleClass ],
            options,
          );
        },
        [
          join(componentPath, `${ name }.component.ts`),
          join(componentPath, `${ name }.component.module.ts`),
        ],
      ));
    }

    if (template && (overwrite || !HasComponent(tree, options))) {
      template.url ??= './files/component';
      rules.push(
        () => console.log(`Template '${ template.url }' will be used to modify the component.`),
        mergeWith(apply(url(template.url), [
          applyTemplates({
            ...strings,
            ...options,
            ...(template?.options ?? {}),
            componentName: name,
          }),
          move(flat ? basePath : join(basePath, name)),
        ]), MergeStrategy.Overwrite),
      );
    }

    return chain(rules);

  };
}
