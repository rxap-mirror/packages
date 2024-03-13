import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
} from '@rxap/workspace-utilities';

export function updateGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'readme');
  CoerceTargetDefaultsDependency(nxJson, 'fix-dependencies', '^fix-dependencies');

  CoerceTargetDefaultsInput(
    nxJson,
    'readme',
    '{projectRoot}/README.md.handlebars',
    '{projectRoot}/GETSTARTED.md',
    '{projectRoot}/GUIDES.md',
    '{projectRoot}/package.json',
    '{projectRoot}/collection.json',
    '{projectRoot}/generators.json',
    '{projectRoot}/executors.json',
    '{projectRoot}/builders.json',
  );
  CoerceTargetDefaultsOutput(nxJson, 'readme', '{projectRoot}/README.md');

  CoerceNxJsonCacheableOperation(nxJson, 'readme');

  CoerceTarget(nxJson, 'linking', {
    executor: '@rxap/plugin-library:node-modules-linking',
    dependsOn: [
      'build',
      '^linking',
    ],
    inputs: [
      {
        env: 'CI_JOB_ID',
      },
    ],
  });

  updateNxJson(tree, nxJson);

}
