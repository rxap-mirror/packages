import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitGeneratorSchema } from './schema';

export function updateJestConfig(tree: Tree, project: ProjectConfiguration, projectName: string, options: InitGeneratorSchema) {

  const projectRoot = project.root;
  const jestConfigFilePath = `${ projectRoot }/jest.config.ts`;
  if (tree.exists(jestConfigFilePath)) {
    const projectRoot = project.root;
    let content = tree.read(jestConfigFilePath, 'utf-8')!;
    // region add reporters
    if (!content.includes('reporters: [')) {
      content = content.replace(`displayName: '${ projectName }',`, `displayName: '${ projectName }',
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "junit/${projectRoot}",
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
