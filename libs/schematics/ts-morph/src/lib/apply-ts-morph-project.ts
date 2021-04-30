import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { Project } from 'ts-morph';

export function ApplyTsMorphProject(project: Project, basePath: string = '', organizeImports: boolean = true): Rule {
  return tree => {

    if (organizeImports) {
      console.debug(`organize '${project.getSourceFiles().length}' ts files imports`);
      project
        .getSourceFiles()
        .forEach(sourceFile => sourceFile.organizeImports());
    }

    console.debug(`write '${project.getSourceFiles().length}' ts files to tree`);
    project
      .getSourceFiles()
      .forEach(sourceFile => {

        const filePath = join(basePath, sourceFile.getFilePath());

        if (tree.exists(filePath)) {
          tree.overwrite(filePath, sourceFile.getFullText());
        } else {
          tree.create(filePath, sourceFile.getFullText());
        }

      });

  };
}
