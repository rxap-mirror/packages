import { Tree } from '@nx/devkit';
import { CoerceFile } from '@rxap/workspace-utilities';
import {
  parse,
  stringify,
} from 'yaml';
import {
  CoerceInclude,
  Include,
} from './coerce-include';
import { Rule } from './coerce-rule';
import { InitGeneratorSchema } from './schema';

export function generateWithComponents(tree: Tree, options: InitGeneratorSchema) {

  const gitlabCiContent = CoerceFile(tree, '.gitlab-ci.yml', '', options.overwrite);

  const gitlabCi: { include: Include[] } = parse(gitlabCiContent) ?? {};

  gitlabCi.include ??= [];

  CoerceInclude(gitlabCi.include, { component: 'gitlab.com/rxap/gitlab-ci/base@~latest' });

  switch (options.release) {
    case 'semantic-release':
      throw new Error('The release type semantic-release is not supported with gitlab ci components.');
    case 'release-it':
      CoerceInclude(gitlabCi.include, { component: 'gitlab.com/rxap/gitlab-ci/release-it@~latest' });
      break;
  }

  if (options.helmChart) {
    console.warn('Not implemented yet!');
  }

  const inputs: Record<string, unknown> = {};

  if (options.dte) {
    inputs.dte = true;
    inputs.parallel = options.parallel;
  }

  const rules: Rule[] = [];

  if (options.release === 'release-it') {
    rules.push({ if: '$RELEASE_IT != "true"' });
  }

  CoerceInclude(gitlabCi.include, {
    component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@~latest',
    rules,
    inputs,
  });

  tree.write('.gitlab-ci.yml', stringify(gitlabCi));

}
