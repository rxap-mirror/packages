import { Tree } from '@nx/devkit';
import { camelize } from '@rxap/utilities';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';

export function cleanup(tree: Tree, projectName: string) {
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);
  const initialFile = join(projectSourceRoot, 'lib', `${projectName}.ts`);
  const initialTestFile = join(projectSourceRoot, 'lib', `${projectName}.spec.ts`);

  if (tree.exists(initialFile) && tree.exists(initialTestFile)) {
    if (tree.read(initialFile, 'utf-8')!.includes(`export function ${camelize(projectName)}(): string {
  return '${projectName}';
}`)) {
      tree.delete(initialFile);
      tree.delete(initialTestFile);
      tree.write(join(projectSourceRoot, 'index.ts'), `export {};\n`);
    }
  }
}
