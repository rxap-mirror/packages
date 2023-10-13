import {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';

export function OrganizeImports(): Rule {
  return (tree: Tree) => {
    const project = CreateProject();
    console.debug('organize imports for ts files');

    for (const action of tree.actions.slice()) {
      switch (action.kind) {

        case 'c':
        case 'o':
          if (action.path.match(/\.ts$/)) {
            project.createSourceFile(action.path, action.content.toString('utf-8'), { overwrite: true });
          }
          break;

      }
    }

    project.getSourceFiles().forEach(sourceFile => {
      sourceFile.organizeImports();
      tree.overwrite(sourceFile.getFilePath(), sourceFile.getFullText());
    });
  };
}
