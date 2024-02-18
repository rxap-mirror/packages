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
  GetProjectPrefix,
} from '@rxap/schematics-utilities';
import { CoerceComponent } from '@rxap/ts-morph';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
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
  overwrite?: boolean | string[];
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
          CoerceComponent(componentSourceFile, name, {
            prefix,
            changeDetection: 'OnPush',
          });
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

    if (template && (
      overwrite === true || (
                  Array.isArray(overwrite) && overwrite?.includes('template')
                ) || !hasComponent
    )) {
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
        () => console.log(`Template options: ${ JSON.stringify(templateOptions) }`),
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
