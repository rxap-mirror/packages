import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import {
  classify,
  CoerceFile,
  dasherize,
  GetProjectPrefix,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { BuildAngularBasePath } from './build-angular-base-path';
import { HasComponent } from './has-component';

export interface TemplateOptions {
  url?: string,
  options?: Record<string, unknown> | object,
}

export interface CoerceComponentOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  flat?: boolean;
  template?: TemplateOptions;
  overwrite?: boolean;
  tsMorphTransform?: (
    project: Project,
    [ componentSourceFile ]: [ SourceFile ],
    [ componentClass ]: [ ClassDeclaration ],
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


    const rules: Rule[] = [];

    const basePath = BuildAngularBasePath(tree, options);
    const hasComponent = HasComponent(tree, options);
    const componentPath = flat ? '' : name;
    const prefix = GetProjectPrefix(tree, options.project);

    if (!hasComponent) {
      rules.push(() => console.log(`Project '${ project }' does not have a component '${ name }' in the feature '${ feature }' in the directory '${ directory }', New component will be created.`));
      rules.push(TsMorphAngularProjectTransformRule(
        options,
        (project, [ componentSourceFile ]) => {
          componentSourceFile.addClass({
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
                    standalone: 'true',
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
        },
        [
          join(componentPath, `${ name }.component.ts?`),
        ],
      ));
      rules.push(tree => {
        CoerceFile(tree, join(basePath, componentPath, `${ name }.component.html`), '');
        CoerceFile(tree, join(basePath, componentPath, `${ name }.component.scss`), '');
      });
    }

    if (template && (overwrite || !hasComponent)) {
      template.url ??= './files/component';
      const templateOptions = {
        ...strings,
        prefix,
        scope: `${ prefix }`,
        ...options,
        ...(template?.options ?? {}),
        componentName: name,
      };
      templateOptions['prefix'] ??= GetProjectPrefix(tree, options.project);
      rules.push(
        () => console.log(`Template '${ template!.url }' will be used to modify the component.`),
        mergeWith(apply(url(template.url), [
          applyTemplates(templateOptions),
          move(flat ? basePath : join(basePath, name)),
        ]), MergeStrategy.Overwrite),
      );
    }

    if (tsMorphTransform) {
      rules.push(TsMorphAngularProjectTransformRule(
        options,
        (project, [ componentSourceFile ]) => {
          const componentClass = componentSourceFile.getClassOrThrow(`${ classify(name) }Component`);
          tsMorphTransform!(
            project,
            [ componentSourceFile ],
            [ componentClass ],
            options,
          );
        },
        [
          join(componentPath, `${ name }.component.ts`),
        ],
      ));
    }

    return chain(rules);

  };
}
