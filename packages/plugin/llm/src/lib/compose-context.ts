import { SourceFile } from 'ts-morph';
import { Builder } from 'xml2js';
import { clearAllJsDocs } from './clear-all-js-docs';

export interface ContextSourceFile {
  $: {
    path: string;
  }
  _: string;
}

interface Context {
  referenced: {
    sourceFile: ContextSourceFile[];
  }
  used: {
    sourceFile: ContextSourceFile[];
  }
}

export function sourceFileToContextSourceFile(sourceFile: SourceFile): ContextSourceFile {
  return {
    $: {
      path: sourceFile.getFilePath(),
    },
    _: '\n' + clearAllJsDocs(sourceFile).getFullText()
  };
}

function getReferenced(sourceFile: SourceFile): SourceFile[] {
  return [
    ...sourceFile.getReferencedSourceFiles(),
    ...sourceFile.getReferencedSourceFiles().map(sf => getReferenced(sf)).flat()
  ];
}

export function composeContext(sourceFile: SourceFile) {

  const builder = new Builder();

  const context: Context = {
    referenced: { sourceFile: [] },
    used: { sourceFile: [] },
  };

  sourceFile.getReferencingSourceFiles().forEach(sf => {
    context.used.sourceFile.push(sourceFileToContextSourceFile(sf));
  });

  getReferenced(sourceFile).forEach(sf => {
    context.referenced.sourceFile.push(sourceFileToContextSourceFile(sf));
  });

  return builder.buildObject(context).replace(/root>/g, 'context>') + '\n';

}
