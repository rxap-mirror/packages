import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
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
        suiteName: "workspace",
        uniqueOutputName: true,
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        usePathForSuiteName: "true"
      },
    ],
  ],`);
    }
    // endregion
    tree.write(jestConfigFilePath, content);
  }

}
