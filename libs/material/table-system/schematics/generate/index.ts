import { GenerateSchema } from './schema';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  Tree,
  url
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import {
  IndentationText,
  Project,
  QuoteKind
} from 'ts-morph';
import { formatFiles } from '@nrwl/workspace';
import { XmlParserService } from '@rxap/xml-parser';
import { TableSystemElements } from './elements/elements';
import { TableElement } from './elements/table.element';
import { readAngularJsonFile } from '@rxap/schematics/utilities';


const { dasherize, classify, camelize } = strings;

export default function(options: GenerateSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    const templateFile = host.read(options.template)?.toString('utf-8');

    const parser = new XmlParserService();

    parser.register(...TableSystemElements);

    const tableElement = parser.parseFromXml<TableElement>(templateFile!);

    options.name    = options.name ?? tableElement.id;
    tableElement.id = options.name;

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      }
    });

    if (!options.openApiModule) {
      const angularJson = readAngularJsonFile(host);
      if (Object.keys(angularJson.projects).includes('open-api')) {
        options.openApiModule = `@${angularJson.projects[ 'open-api' ].prefix}/open-api`;
      } else {
        options.openApiModule = `@${angularJson.projects[ angularJson.defaultProject ].prefix}/open-api`;
      }
    }

    let path: string = '';

    if (!options.path) {
      path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      path = join(projectRootPath, options.path);
    }

    options.path = path = join(path, dasherize(options.name) + '-table');

    const hasComponentModule = host.exists(join(path, dasherize(options.name) + '-table.component.ts'));

    return chain([
      hasComponentModule ? noop() : externalSchematic('@rxap/schematics', 'component-module', {
        path:    options.path.replace(/^\//, ''),
        project: options.project,
        name:    dasherize(options.name) + '-table',
        theme:   false,
        flat:    true
      }),
      mergeWith(apply(url('./files'), [
        applyTemplates({
          tableElement,
          ...strings,
          ...options
        }),
        move(path),
        forEach(fileEntry => {

          if (host.exists(fileEntry.path)) {

            if (options.overwrite) {
              host.overwrite(fileEntry.path, fileEntry.content);
            }

            return null;
          }

          return fileEntry;
        })
      ]), MergeStrategy.Overwrite),
      tableElement.hasFilter ? externalSchematic('@rxap/forms', 'generate', {
        path:        path.replace(/^\//, ''),
        formElement: tableElement.createFormElement(),
        component:   false,
        project:     options.project,
        flat:        true
      }) : noop(),
      tableElement.toValue({ project, options }),
      formatFiles(),
      (tree, ctx) => {
        if (ctx.debug) {
          console.log(tree.read(join(options.path!, dasherize(options.name!) + '-table.component.module.ts'))!.toString('utf-8'));
          console.log(tree.read(join(options.path!, dasherize(options.name!) + '-table.component.ts'))!.toString('utf-8'));
          console.log(tree.read(join(options.path!, dasherize(options.name!) + '-table.component.html'))!.toString('utf-8'));
        }
      },
    ]);

  };

}
