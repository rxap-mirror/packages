import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceFile } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateJestConfig(
  tree: Tree,
  project: ProjectConfiguration,
  projectName: string,
  options: InitGeneratorSchema,
  jestConfigFileName = 'jest.config.ts'
) {

  const projectRoot = project.root;
  const jestConfigFilePath = `${ projectRoot }/${jestConfigFileName}`;
  if (tree.exists(jestConfigFilePath)) {
    let content = tree.read(jestConfigFilePath, 'utf-8')!;
    const outputDirectorySuffix = project.root === '' ? projectName : project.root;
    // region add reporters
    if (!content.includes('reporters: [')) {
      content = content.replace(`displayName: '${ projectName }',`, `displayName: '${ projectName }',
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "junit/${outputDirectorySuffix}",
        suiteName: '${projectName}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],`);
    }
    // endregion
    CoerceFile(tree, jestConfigFilePath, content, true);
  }

}
