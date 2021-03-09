import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { RoutingSchema } from '../schema';
import { Rule, Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { ParseTemplate } from '@rxap/schematics-utilities';
import { RoutingElement } from './routing.element';
import { Elements } from './elements';

const { dasherize, classify, camelize } = strings;

export function FindRoutingModule(tree: Tree, basePath: string): string {
  const baseDir = tree.getDir(basePath);
  for (const file of baseDir.subfiles) {
    const filePath = join(basePath, file);
    if (tree.read(filePath)?.toString('utf-8').match(/routes:\s?Routes/i)) {
      return filePath;
    }
  }
  throw new Error('Could not find the routing module');
}

export function HandelTemplate(options: RoutingSchema): Rule {
  return async (tree, context) => {

    if (!tree.exists(options.template)) {
      console.error(`Could not find xml template in path '${ options.template }'`);
      return () => {
      };
    }

    const projectRootPath = await createDefaultPath(tree, options.project as string);
    const routingElement = ParseTemplate<RoutingElement>(tree, options.template, ...Elements);
    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
    });
    if (!options.routingModule) {
      options.routingModule = FindRoutingModule(tree, projectRootPath);
    }
    project.createSourceFile(options.routingModule, tree.read(options.routingModule)?.toString('utf-8'));
    return routingElement.toValue({ project, options });
  };
}
