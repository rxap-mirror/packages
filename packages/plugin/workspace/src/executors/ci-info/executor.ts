import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import {
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { CiInfoExecutorSchema } from './schema';

interface BuildInfo {
  release?: string;
  commit?: string;
  timestamp?: string;
  branch?: string;
  tag?: string;
  name?: string;
  url?: string;
  tier?: string;
  job?: string;
  pipeline?: string;
  project?: string;
  runner?: string;
  slug?: {
    name?: string;
    branch?: string;
    tag?: string;
  };
}

function createBuildInfo(options: CiInfoExecutorSchema) {
  const buildInfo: BuildInfo = options;

  if (!buildInfo.timestamp) {
    buildInfo.timestamp = process.env.CI_COMMIT_TIMESTAMP ?? new Date().toISOString();
  }

  if (!buildInfo.branch && process.env.CI_COMMIT_BRANCH) {
    buildInfo.branch = process.env.CI_COMMIT_BRANCH;
  }

  if (!buildInfo.tag && process.env.CI_COMMIT_TAG) {
    buildInfo.tag = process.env.CI_COMMIT_TAG;
  }

  if (!buildInfo.commit && process.env.CI_COMMIT_SHA) {
    buildInfo.commit = process.env.CI_COMMIT_SHA;
  }

  if (!buildInfo.name && process.env.CI_ENVIRONMENT_NAME) {
    buildInfo.name = process.env.CI_ENVIRONMENT_NAME;
  }

  if (!buildInfo.job && process.env.CI_JOB_ID) {
    buildInfo.job = process.env.CI_JOB_ID;
  }

  if (!buildInfo.pipeline && process.env.CI_PIPELINE_ID) {
    buildInfo.pipeline = process.env.CI_PIPELINE_ID;
  }

  if (!buildInfo.project && process.env.CI_PROJECT_ID) {
    buildInfo.project = process.env.CI_PROJECT_ID;
  }

  if (!buildInfo.runner && process.env.CI_RUNNER_ID) {
    buildInfo.runner = process.env.CI_RUNNER_ID;
  }

  if (!buildInfo.url && process.env.CI_ENVIRONMENT_URL) {
    buildInfo.url = process.env.CI_ENVIRONMENT_URL;
  }

  if (!buildInfo.tier && process.env.CI_ENVIRONMENT_TIER) {
    buildInfo.tier = process.env.CI_ENVIRONMENT_TIER;
  }

  if (!buildInfo.slug) {
    buildInfo.slug = {};
  }

  if (!buildInfo.slug.name && process.env.CI_ENVIRONMENT_SLUG) {
    buildInfo.slug.name = process.env.CI_ENVIRONMENT_SLUG;
  }

  if (!buildInfo.slug.tag && process.env.CI_COMMIT_TAG && process.env.CI_COMMIT_REF_SLUG) {
    buildInfo.slug.tag = process.env.CI_COMMIT_REF_SLUG;
  }

  if (!buildInfo.slug.branch && process.env.CI_COMMIT_BRANCH && process.env.CI_COMMIT_REF_SLUG) {
    buildInfo.slug.branch = process.env.CI_COMMIT_REF_SLUG;
  }

  return buildInfo;
}

function containsOnlyDirectories(folderPath: string): boolean {
  const items = readdirSync(folderPath);
  for (const item of items) {
    const itemPath = join(folderPath, item);
    if (statSync(itemPath).isFile()) {
      return false;
    }
  }
  return true;
}

export default async function runExecutor(
  options: CiInfoExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for CiInfo', options);

  const buildInfo = createBuildInfo(options);

  const buildJsonFile = JSON.stringify(buildInfo, undefined, 2);

  for (const [ projectName, projectNode ] of Object.entries(context.projectGraph?.nodes ?? {})) {

    if (![ 'app', 'lib' ].includes(projectNode.type)) {
      console.log(`Skipping ${ projectName } because it is not an app or lib`);
      continue;
    }

    if (!projectNode.data.targets?.['build']) {
      console.log(`Skipping ${ projectName } because it does not have a build target`);
      continue;
    }

    const outputPath = GuessOutputPath(context, projectName);

    const outputPathList: string[] = [];

    if (containsOnlyDirectories(outputPath)) {
      const items = readdirSync(outputPath);
      for (const item of items) {
        const itemPath = join(outputPath, item);
        if (!statSync(itemPath).isFile()) {
          outputPathList.push(join(outputPath, item));
        }
      }
    } else {
      outputPathList.push(outputPath);
    }

    for (const outputPath of outputPathList) {
      console.log(`Writing build info for ${ projectName } to ${ outputPath }/build.json`);
      writeFileSync(join(outputPath, 'build.json'), buildJsonFile);
    }
  }

  console.log('build.json files written successfully');
  console.log(JSON.stringify(buildInfo, undefined, 2));

  return {
    success: true,
  };
}
