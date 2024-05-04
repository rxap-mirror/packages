import { Tree } from '@nx/devkit';
import {
  CoerceFile,
  CoerceFilesStructure,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  parse,
  stringify,
} from 'yaml';
import { CoerceInclude } from './coerce-include';
import {
  CoerceRules,
  RuleWhen,
} from './coerce-rule';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init gitlab ci workspace');

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'basic'),
    target: '',
    overwrite: options.overwrite,
  });

  if (options.onlyPackages) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'packages'),
      target: '',
      overwrite: options.overwrite,
    });
  } else {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'application'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.dte) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'dte'),
      target: '',
      overwrite: options.overwrite,
    });
  } else {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'simple'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.angular) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'angular'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.release === 'release-it') {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'release-it'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.release === 'semantic-release') {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'semantic-release'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  const gitlabCiContent = CoerceFile(tree, '.gitlab-ci.yml', '');
  const gitlabCi = parse(gitlabCiContent) ?? {};

  gitlabCi.variables ??= {};
  gitlabCi.include ??= [];

  const buildYaml = parse(tree.read('.gitlab/ci/pipelines/build.yaml', 'utf-8'));
  buildYaml.workflow ??= {};
  buildYaml.workflow.rules ??= [];
  buildYaml.include ??= [];
  let buildYamlChanged = false;

  CoerceInclude(gitlabCi.include, '.gitlab/ci/utilities/base.yaml');

  if (options.onlyPackages) {
    buildYamlChanged = true;
    buildYaml.include = buildYaml.include.filter(({local}) => local !== '.gitlab/ci/release.yaml');
  }

  if (options.angular) {
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/angular.yaml');
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/build.yaml', [
      {
        if: '$DEPLOYMENT_TRIGGER == "true"',
        when: RuleWhen.NEVER
      },
      {
        if: '$E2E_TRIGGER == "true"',
        when: RuleWhen.NEVER
      },
      {
        if: '$COERCE_IMAGE_TRIGGER == "true"',
        when: RuleWhen.NEVER
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(e2e)\\]/',
        when: RuleWhen.NEVER
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(deploy)\\]/',
        when: RuleWhen.NEVER
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(image)\\]/',
        when: RuleWhen.NEVER
      }
    ]);
  }

  if (options.release === 'release-it') {
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/release-it.yaml');
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/build.yaml', [
      { if: '$RELEASE_IT == \'true\'', when: RuleWhen.NEVER }
    ]);
  }

  if (options.release === 'semantic-release') {
    if (options.angular) {
      buildYamlChanged = true;
      CoerceRules(buildYaml.workflow.rules, [
        {
          if: '$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        },
        {
          if: '$CI_MERGE_REQUEST_EVENT_TYPE == "merge_train" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/setup.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        },
        {
          when: RuleWhen.ALWAYS
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/pages.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/coverage-report.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/review.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/branch.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: RuleWhen.NEVER
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/channel.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/'
        }
      ]);
    }
  }

  CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/build.yaml', [
    { if: '$CI_PIPELINE_SOURCE =~ /^(push|web|merge_request_event)$/' }
  ]);

  if (Object.keys(gitlabCi.variables).length === 0) {
    delete gitlabCi.variables;
  }
  if (gitlabCi.include.length === 0) {
    delete gitlabCi.include;
  }
  tree.write('.gitlab-ci.yml', stringify(gitlabCi));

  if (buildYamlChanged) {
    if (buildYaml.workflow.rules.length === 0) {
      delete buildYaml.workflow.rules;
    }
    if (Object.keys(buildYaml.workflow).length === 0) {
      delete buildYaml.workflow;
    }
    if (buildYaml.include.length === 0) {
      delete buildYaml.include;
    }
    tree.write('.gitlab/ci/pipelines/build.yaml', stringify(buildYaml));
  }

}
