import { strings } from '@angular-devkit/core';
import {
  apply,
  applyPathTemplate,
  applyTemplates,
  chain,
  composeFileOperators,
  FileEntry,
  FileOperator,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  PathTemplateData,
  Rule,
  url,
  when,
} from '@angular-devkit/schematics';
import {
  classify,
  CoerceFile,
  GetProjectPrefix,
} from '@rxap/schematics-utilities';
import { CoerceComponent } from '@rxap/ts-morph';
import {
  camelize,
  capitalize,
  dasherize,
  decamelize,
  underscore,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
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
import 'colors';

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
  handlebars?: {
    helpers?: Record<string, Handlebars.HelperDelegate>,
    partials?: Record<string, Handlebars.TemplateDelegate>,
  };
}

function applyContentHandlebars<T>(options: T): FileOperator {
  return (entry: FileEntry) => {
    const { path, content } = entry;

    Handlebars.registerHelper('compile', (context: Handlebars.HelperDelegate, input) => {
      return new Handlebars.SafeString(context(input.hash));
    });

    Handlebars.registerHelper('indent', (text, spaces) => {
      const indent = new Array(spaces + 1).join(' ');
      if (text instanceof Handlebars.SafeString) {
        text = text.toString();
      }
      return new Handlebars.SafeString(text.split('\n').map((line: string, index: number) => {
        return index === 0 ? line : indent + line;
      }).join('\n'));
    });

    Handlebars.registerHelper('dasherize', value => dasherize(value));
    Handlebars.registerHelper('classify', value => classify(value));
    Handlebars.registerHelper('decamelize', value => decamelize(value));
    Handlebars.registerHelper('camelize', value => camelize(value));
    Handlebars.registerHelper('underscore', value => underscore(value));
    Handlebars.registerHelper('capitalize', value => capitalize(value));


    try {
      const template = Handlebars.compile(content.toString());

      return {
        path,
        content: Buffer.from(template(options)),
      };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ERR_ENCODING_INVALID_ENCODED_DATA') {
        return entry;
      }

      throw e;
    }
  };
}

function applyHandlebars<T extends object>(options: T): Rule {
  return forEach(
    when(
      (path) => path.endsWith('.hbs'),
      composeFileOperators([
        applyContentHandlebars(options),
        // See above for this weird cast.
        applyPathTemplate(options as any as PathTemplateData),
        (entry) => {
          return {
            content: entry.content,
            path: entry.path.replace(/\.hbs$/, ''),
          } as FileEntry;
        },
      ]),
    ),
  );
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
    handlebars
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
      if (handlebars) {
        if (handlebars.helpers) {
          Handlebars.registerHelper(handlebars.helpers);
        }
        if (handlebars.partials) {
          Handlebars.registerPartial(handlebars.partials);
        }
      }
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
        () => console.log(`Template options: ${ JSON.stringify(templateOptions) }`.grey),
        mergeWith(apply(url(template.url), [
          applyTemplates(templateOptions),
          applyHandlebars(templateOptions),
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
