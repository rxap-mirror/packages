import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  Assets,
  CoerceAssets,
  GetProjectRoot,
  GetTargetOptions,
} from '@rxap/workspace-utilities';

export function updateProjectTargets(tree: Tree, projectName: string, project: ProjectConfiguration) {

  const projectRoot = GetProjectRoot(tree, projectName);

  const buildTargetOptions: { assets?: Assets } = GetTargetOptions(project, 'build');
  buildTargetOptions.assets ??= [];
  CoerceAssets(buildTargetOptions.assets, [
    {
      input: `./${projectRoot}`,
      glob: "migrations.json",
      output: "."
    },
    {
      input: `./${projectRoot}/src/migrations`,
      glob: "**/!(*.ts|*.js|*.json)",
      output: "./src/migrations"
    }
  ]);

}
