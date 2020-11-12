import {
  Project,
  IndentationText,
  QuoteKind
} from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { AddDir } from './add-dir';

export function AutoImport(basePath: string, autoImportBasePath: string = basePath): Rule {
  return tree => {
    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      }
    });
    AddDir(tree.getDir(basePath), project, basePath, pf => !!pf.match(/\.ts$/));
    console.log('auto import for ts files');
    project.getSourceFiles().filter(sourceFile => sourceFile.getFilePath().includes(autoImportBasePath)).forEach(sourceFile => {
      sourceFile.fixMissingImports();
      tree.overwrite(sourceFile.getFilePath(), sourceFile.getFullText());
    });
  };
}
