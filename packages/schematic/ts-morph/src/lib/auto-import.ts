import { CreateProject } from '@rxap/ts-morph';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { AddDir } from './add-dir';

/**
 * @deprecated use FixMissingImports instead
 */
export function AutoImport(basePath: string, autoImportBasePath: string = basePath): Rule {
  return tree => {
    const project = CreateProject();
    AddDir(tree.getDir(basePath), project, basePath, pf => !!pf.match(/\.ts$/));
    console.debug('auto import for ts files');
    project.getSourceFiles()
           .filter(sourceFile => sourceFile.getFilePath().includes(autoImportBasePath))
           .forEach(sourceFile => {
             sourceFile.fixMissingImports();
             tree.overwrite(sourceFile.getFilePath(), sourceFile.getFullText());
           });
  };
}
