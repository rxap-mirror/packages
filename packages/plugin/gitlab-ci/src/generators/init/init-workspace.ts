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
import {
  CoerceInclude,
  CoerceRules,
} from './coerce-include';
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

  const gitlabCiContent = CoerceFile(tree, '.gitlab-ci.yml', '');
  const gitlabCi = parse(gitlabCiContent);

  gitlabCi.variables ??= {};
  gitlabCi.include ??= [];

  const buildYaml = parse(tree.read('.gitlab/ci/pipelines/build.yaml', 'utf-8'));
  buildYaml.workflow ??= {};
  buildYaml.workflow.rules ??= [];
  buildYaml.include ??= [];

  CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/base.yaml');

  if (!options.onlyPackages) {
    CoerceInclude(buildYaml.include, '.gitlab/ci/release.yaml', [
      {
        if: '$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+/'
      }
    ]);
  }

  if (options.angular) {
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/angular.yaml');
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/build.yaml', [
      {
        if: '$DEPLOYMENT_TRIGGER == "true"',
        when: 'never'
      },
      {
        if: '$E2E_TRIGGER == "true"',
        when: 'never'
      },
      {
        if: '$COERCE_IMAGE_TRIGGER == "true"',
        when: 'never'
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(e2e)\\]/',
        when: 'never'
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(deploy)\\]/',
        when: 'never'
      },
      {
        if: '$CI_COMMIT_MESSAGE =~ /\\[(image)\\]/',
        when: 'never'
      }
    ]);
  }

  if (options.release === 'release-it') {
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/release-it.yaml');
    CoerceInclude(gitlabCi.include, '.gitlab/ci/pipelines/build.yaml', [
      { if: '$RELEASE_IT == \'true\'', when: 'never' }
    ]);
  }
  if (options.release === 'semantic-release') {
    if (options.angular) {
      CoerceRules(buildYaml.workflow.rules, [
        {
          if: '$CI_COMMIT_BRANCH && $CI_COMMIT_MESSAGE =~ /^release:/',
          when: 'never'
        },
        {
          if: '$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        },
        {
          if: '$CI_MERGE_REQUEST_EVENT_TYPE == "merge_train" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/setup.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        },
        {
          when: 'always'
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/pages.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/jobs/coverage-report.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/review.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
        }
      ]);
      CoerceInclude(buildYaml.include, '.gitlab/ci/branch.yaml', [
        {
          if: '$CI_COMMIT_BRANCH =~ /^(release|release-candidate|preview|[0-9]+\\.[0-9]+\\.x|[0-9]+\\.x)$/',
          when: 'never'
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

  tree.write('.gitlab-ci.yml', stringify(gitlabCi));
  tree.write('.gitlab/ci/pipelines/build.yaml', stringify(buildYaml));

}
