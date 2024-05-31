import {
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  Assets,
  CoerceAssets,
  GetProjectRoot,
  GetTarget,
  GetTargetOptions,
} from '@rxap/workspace-utilities';

export function updateProjectTargets(tree: Tree, projectName: string, project: ProjectConfiguration) {

  const projectRoot = GetProjectRoot(tree, projectName);

  const buildTarget = GetTarget(project, 'build');
  const buildTargetOptions: { assets?: Assets } = GetTargetOptions(buildTarget);
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
  updateProjectConfiguration(tree, projectName, project);

}
