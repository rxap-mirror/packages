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
import {
  InitGeneratorSchema,
  InitReleaseGeneratorSchemaEnum,
} from './schema';

function buildIncludeForComponent(name: string, version: string, source: 'component' | 'local') {
  switch (source) {
    default:
    case 'component':
      return {
        component: `gitlab.com/rxap/gitlab-ci/${name}@${version}`,
      };
    case 'local':
      return {
        local: `templates/${name}.yml`,
      };
  }
}

export function generateWithComponents(tree: Tree, options: InitGeneratorSchema) {

  const gitlabCiContent = CoerceFile(tree, '.gitlab-ci.yml', '', options.overwrite);

  const gitlabCi: { include: Include[] } = parse(gitlabCiContent) ?? {};

  gitlabCi.include ??= [];

  CoerceInclude(gitlabCi.include, buildIncludeForComponent('base', '~latest', options.componentsSource));

  switch (options.release) {
    case InitReleaseGeneratorSchemaEnum.SCHEMATIC_RELEASE:
      throw new Error('The release type semantic-release is not supported with gitlab ci components.');
    case InitReleaseGeneratorSchemaEnum.RELEASE_IT:
      CoerceInclude(gitlabCi.include, buildIncludeForComponent('release-it', '~latest', options.componentsSource));
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
    ...buildIncludeForComponent('nx-workspace', '~latest', options.componentsSource),
    rules,
    inputs,
  });

  CoerceFile(tree, '.gitlab-ci.yml', stringify(gitlabCi), true);

}
