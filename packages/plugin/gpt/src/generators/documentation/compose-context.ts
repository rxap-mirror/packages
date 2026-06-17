import { SourceFile } from 'ts-morph';
import { Builder } from 'xml2js';

interface ContextSourceFile {
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

function sourceFileToContextSourceFile(sourceFile: SourceFile): ContextSourceFile {
  return {
    $: {
      path: sourceFile.getFilePath(),
    },
    _: '\n' + sourceFile.getText({ trimLeadingIndentation: true, includeJsDocComments: false })
  };
}

function getReferenced(sourceFile: SourceFile, visited = new Set<SourceFile>()): SourceFile[] {
  const result: SourceFile[] = [];
  for (const ref of sourceFile.getReferencedSourceFiles()) {
    // guard against circular references and avoid traversing shared files repeatedly
    if (visited.has(ref)) {
      continue;
    }
    visited.add(ref);
    result.push(ref, ...getReferenced(ref, visited));
  }
  return result;
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
