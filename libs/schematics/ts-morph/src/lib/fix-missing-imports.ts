import {
  Rule,
  Tree,
  DirEntry
} from '@angular-devkit/schematics';
import {
  Project,
  IndentationText,
  QuoteKind
} from 'ts-morph';

/**
 *
 * @param basePath (optional) if definition all files from the base path are included and not only the changed or created files
 * @constructor
 */
export function FixMissingImports(basePath?: string): Rule {
  return (tree: Tree) => {
    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      }
    });
    console.debug('fix missing imports for ts files');

    function AddFiles(dir: DirEntry) {
      for (const file of dir.subfiles) {
        if (file.match(/\.ts$/) && !file.match(/\.spec\.ts$/)) {
          project.createSourceFile(file, dir.file(file)!.content.toString('utf-8'));
        }
      }
      for (const subDir of dir.subdirs) {
        AddFiles(dir.dir(subDir));
      }
    }

    if (basePath) {
      AddFiles(tree.getDir(basePath));
    } else {
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
    }

    project.getSourceFiles().forEach(sourceFile => {
      sourceFile.fixMissingImports();
      tree.overwrite(sourceFile.getFilePath(), sourceFile.getFullText());
    });
  };
}
