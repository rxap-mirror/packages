import { Project } from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { AddDir } from './add-dir';

export function AutoImport({ options, project }: { options: { path: string }, project: Project }): Rule {
  return tree => {

    AddDir(tree.getDir(options.path), project, '', pf => !!pf.match(/\.ts$/));

    project.getSourceFiles().forEach(sourceFile => sourceFile.fixMissingImports());

  };
}
