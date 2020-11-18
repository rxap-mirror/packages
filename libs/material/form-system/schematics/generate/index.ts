import { GenerateSchema } from './schema';
import {
  chain,
  Rule,
  Tree,
  noop,
  externalSchematic
} from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { Elements } from './elements/elements';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { strings } from '@angular-devkit/core';
import { FormElement } from './elements/form.element';
import {
  ParseTemplate,
  ApplyTsMorphProject,
  FixMissingImports
} from '@rxap-schematics/utilities';
import {
  IndentationText,
  QuoteKind,
  Project
} from 'ts-morph';

const { dasherize, classify, camelize, capitalize } = strings;

export default function(options: GenerateSchema): Rule {

  return async (host: Tree, context) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    let path: string = options.path ?? '';

    if (!options.path) {
      path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      path = join(projectRootPath, options.path);
    }

    const formElement = ParseTemplate<FormElement>(host, options.template, ...Elements);
    options.name      = options.name ?? formElement.name;

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      }
    });

    if (!options.name) {
      throw new Error('FATAL: the options name is not defined');
    }

    options.path = path = join(path, dasherize(options.name) + '-form');

    console.log('@rxap-material/form-system base path: ', path);

    const componentTemplateFilePath = join(path, dasherize(options.name) + '-form.component.html');
    const componentModuleFilePath   = join(path, dasherize(options.name) + '-form.component.module.ts');
    const componentFilePath         = join(path, dasherize(options.name) + '-form.component.ts');

    const hasComponentTemplate = host.exists(componentTemplateFilePath);

    return chain([
      hasComponentTemplate ? noop() : externalSchematic('@rxap/schematics', 'component-module', {
        path:    options.path.replace(/^\//, ''),
        project: options.project,
        name:    dasherize(options.name) + '-form',
        flat:    true,
        theme:   false
      }),
      formElement.toValue({ project, options }),
      ApplyTsMorphProject(project, options.path, options.organizeImports),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
      context.debug ? tree => {
        console.log('\n==========================================');
        console.log('path: ' + componentFilePath);
        console.log('==========================================');
        console.log(tree.read(componentFilePath)!.toString('utf-8'));
        console.log('\n==========================================');
        console.log('path: ' + componentModuleFilePath);
        console.log('==========================================');
        console.log(tree.read(componentModuleFilePath)!.toString('utf-8'));
        console.log('\n==========================================');
        console.log('path: ' + componentTemplateFilePath);
        console.log('==========================================');
        console.log(tree.read(componentTemplateFilePath)!.toString('utf-8'));
        console.log('==========================================\n');
      } : noop()
    ]);

  };

}
