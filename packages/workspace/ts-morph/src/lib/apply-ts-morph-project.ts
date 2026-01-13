import { CreateProject } from '@rxap/ts-morph';
import {
  GetRootPackageJson,
  getWorkspaceRoot,
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Node,
  Project,
  SourceFile,
} from 'ts-morph';
import { format, resolveConfig } from 'prettier';

/**
 * Determines if two `SourceFile` objects are the same by comparing their leaf nodes.
 *
 * This function iteratively compares the text of each leaf node in both source files.
 * Leaf nodes are the deepest nodes in the file's AST (Abstract Syntax Tree) that do not have children.
 * The comparison stops as soon as a mismatch is found or all corresponding leaf nodes have been compared.
 *
 * @param {SourceFile} sourceFile1 - The first source file to compare.
 * @param {SourceFile} sourceFile2 - The second source file to compare.
 * @returns {boolean} - Returns `true` if all corresponding leaf nodes in both files have the same text, otherwise returns `false`.
 *
 * @example
 * // Assuming `sourceFile1` and `sourceFile2` are both parsed source files:
 * const result = areSame(sourceFile1, sourceFile2);
 * console.log(result); // Outputs: true if the files are the same, false otherwise.
 */
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

/**
 * Applies transformations to TypeScript source files within a given project using the TsMorph library, and synchronizes these changes with a file tree structure.
 *
 * @param {TreeLike} tree - An abstraction representing the file tree to which the project files will be written.
 * @param {Project} project - The TsMorph project instance containing the source files to be processed.
 * @param {string} [basePath=''] - The base path in the file tree where the project files will be located. Defaults to an empty string, representing the root.
 * @param {boolean} [organizeImports=true] - A flag indicating whether to organize imports within each source file. Defaults to true.
 * @param {boolean} [fixMissingImports=false] - A flag indicating whether to automatically fix missing imports within each source file. Defaults to false.
 * @param {boolean} [prettier=true] - A flag indicating whether to format the source files using Prettier. Defaults to true.
 *
 * This function performs the following operations:
 * 1. Optionally fixes missing imports and organizes imports in all source files of the project if the respective flags are set.
 * 2. Iterates over each source file in the project:
 * a. Constructs the full path for the file based on the provided `basePath`.
 * b. Checks if the file already exists in the tree:
 * i. If it exists, reads the current content and compares it with the new content from the source file.
 * If they differ, the file in the tree is overwritten with the new content.
 * ii. If it does not exist, creates a new file in the tree with the content from the source file.
 *
 * Note: This function utilizes the `TreeAdapter` to interact with the file tree, ensuring that file operations are abstracted and can handle different tree implementations.
 */
export function ApplyTsMorphProject(
  tree: TreeLike,
  project: Project,
  basePath = '',
  organizeImports = true,
  fixMissingImports = false,
  prettier = true,
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

  return Promise.allSettled(project
    .getSourceFiles().map(async sourceFile => {

      const filePath = join(basePath, sourceFile.getFilePath());

      if (tree.exists(filePath)) {
        const currentContent = treeAdapter.read(filePath, 'utf-8')!;
        const tmpProject = CreateProject();
        const newContent = await getFormatedFullText(sourceFile, filePath, prettier);
        if (!areSame(sourceFile, tmpProject.createSourceFile('/tmp.ts', currentContent))) {
          treeAdapter.overwrite(filePath, newContent);
        }
      } else {
        treeAdapter.create(filePath, await getFormatedFullText(sourceFile, filePath, prettier));
      }

    }));
}

async function getFormatedFullText(sourceFile: SourceFile, filePath: string, prettier: boolean) {
  if (prettier) {
    const options = await resolveConfig(filePath);
    const content = sourceFile.getFullText();
    return await format(content, { ...options, parser: 'typescript', filepath: filePath });
  } else {
    return sourceFile.getFullText();
  }
}
