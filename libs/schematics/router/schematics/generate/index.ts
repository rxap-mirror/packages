import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { strings } from '@angular-devkit/core';
import { RoutingSchema } from './schema';
import { HandelTemplate } from './elements/utils';
import { readAngularJsonFile } from '@rxap/schematics/utilities';
import { Elements } from './elements/elements';
import {
  OrganizeImports,
  FixMissingImports
} from '@rxap/schematics-utilities';

const { dasherize, classify, camelize, capitalize } = strings;

export default function (options: RoutingSchema): Rule {

  return async (host: Tree) => {

    if (!options.prefix) {
      const angularJson = readAngularJsonFile(host);
      options.prefix = angularJson.projects[options.project].prefix;
    }

    const extendedElements = Elements;

    if (!options.openApiModule) {
      const angularJson = readAngularJsonFile(host);
      if (Object.keys(angularJson.projects).includes('open-api')) {
        options.openApiModule = `@${ angularJson.projects['open-api'].prefix }/open-api`;
      } else {
        options.openApiModule = `@${ angularJson.projects[angularJson.defaultProject].prefix }/open-api`;
      }
    }

    console.log('Extended Elements: ', extendedElements.map(ctor => ctor.name).join(', '));

    return chain([
      HandelTemplate(options),
      options.organizeImports ? OrganizeImports() : noop(),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
    ]);
  };

}
