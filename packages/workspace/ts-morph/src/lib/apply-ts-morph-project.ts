import { CreateProject } from '@rxap/ts-morph';
import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Node,
  Project,
  SourceFile,
} from 'ts-morph';

function areSame(sourceFile1: SourceFile, sourceFile2: SourceFile) {
  const leafNodes1 = getLeafNodes(sourceFile1);
  const leafNodes2 = getLeafNodes(sourceFile2);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const leaf1 = leafNodes1.next();
    const leaf2 = leafNodes2.next();

    if (leaf1.done && leaf2.done) {
      return true;
    }
    if (leaf1.done || leaf2.done) {
      return false;
    }
    if (leaf1.value.getText() !== leaf2.value.getText()) {
      return false;
    }
  }

  function* getLeafNodes(sourceFile: SourceFile): Iterator<Node> {
    yield* searchNode(sourceFile);

    function* searchNode(node: Node): any {
      const children = node.getChildren();
      if (children.length === 0) {
        yield node;
      } else {
        for (const child of children) {
          yield* searchNode(child);
        }
      }
    }
  }
}

export function ApplyTsMorphProject(
  tree: TreeLike,
  project: Project,
  basePath = '',
  organizeImports = true,
  fixMissingImports = false,
) {
  if (organizeImports || fixMissingImports) {
    project
      .getSourceFiles()
      .forEach(sourceFile => {
        if (fixMissingImports) {
          sourceFile.fixMissingImports();
        }
        if (organizeImports) {
          sourceFile.organizeImports();
        }
      });
  }

  const treeAdapter = new TreeAdapter(tree);

  project
    .getSourceFiles()
    .forEach(sourceFile => {

      const filePath = join(basePath, sourceFile.getFilePath());

      if (tree.exists(filePath)) {
        const currentContent = treeAdapter.read(filePath)!.toString('utf-8');
        const tmpProject = CreateProject();
        const newContent = sourceFile.getFullText();
        if (!areSame(sourceFile, tmpProject.createSourceFile('/tmp.ts', currentContent))) {
          treeAdapter.overwrite(filePath, newContent);
        }
      } else {
        treeAdapter.create(filePath, sourceFile.getFullText());
      }

    });
}
