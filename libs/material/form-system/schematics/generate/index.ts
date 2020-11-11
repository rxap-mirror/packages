import { GenerateSchema } from './schema';
import {
  chain,
  Rule,
  Tree,
  noop
} from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { Elements } from './elements/elements';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { strings } from '@angular-devkit/core';
import { FormElement } from './elements/form.element';
import { ParseTemplate } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

export default function(options: GenerateSchema): Rule {

  return async (host: Tree, context) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    let path: string = '';

    if (!options.path) {
      path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      path = join(projectRootPath, options.path);
    }

    const formElement = ParseTemplate<FormElement>(host, options.template, ...Elements);

    options.name     = options.name ?? formElement.name;
    formElement.name = options.name;

    path = join(path, dasherize(options.name) + '-form');

    const componentFilePath = join(path, dasherize(options.name) + '-form.component.html');

    return chain([
      tree => {
        if (tree.exists(componentFilePath)) {
          tree.overwrite(componentFilePath, formElement.template());
        } else {
          tree.create(componentFilePath, formElement.template());
        }
      },
      formatFiles(),
      context.debug ? tree => {
        console.log('\n==========================================');
        console.log('path: ' + componentFilePath);
        console.log('==========================================');
        console.log(tree.read(componentFilePath)!.toString('utf-8'));
        console.log('==========================================\n');
      } : noop()
    ]);

  };

}
