import {
  chain,
  Rule,
  Tree,
  externalSchematic
} from '@angular-devkit/schematics';
import {
  Project,
  IndentationText,
  QuoteKind
} from 'ts-morph';
import { ParseTemplate } from './parse-template';
import { FindRoutingModule } from './find-routing-module';
import { createDefaultPath } from '@schematics/angular/utility/workspace';

export function HandelTemplate(options: Record<string, any>): Rule {
  return async (tree, context) => {

    if (!tree.exists(options.template)) {
      console.error(`Could not find xml template in path '${options.template}'`);
      return () => {};
    }

    const projectRootPath = await createDefaultPath(tree, options.project as string);
    const routingElement  = ParseTemplate(tree, options.template);
    const project         = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true
      }
    });
    if (!options.routingModule) {
      options.routingModule = FindRoutingModule(tree, projectRootPath);
    }
    project.createSourceFile(options.routingModule, tree.read(options.routingModule)?.toString('utf-8'));
    if (routingElement.toValue) {
      return routingElement.toValue({ project, options });
    }
    return () => {};
  };
}
