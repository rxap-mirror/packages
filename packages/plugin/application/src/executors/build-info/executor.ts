import { ExecutorContext } from '@nx/devkit';
import { GetProjectConfiguration } from '@rxap/plugin-utilities';
import {
  existsSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { BuildInfoExecutorSchema } from './schema';

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

function createBuildInfo(options: BuildInfoExecutorSchema) {
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

export default async function runExecutor(
  options: BuildInfoExecutorSchema,
  context: ExecutorContext,
) {

  const project = GetProjectConfiguration(context);

  const buildInfo = createBuildInfo(options);

  const buildJsonFile = JSON.stringify(buildInfo, undefined, 2);

  if (!project.sourceRoot) {
    throw new Error(`The project '${ project.name }' has no source root`);
  }

  const buildInfoFilePath = join(context.root, project.sourceRoot, 'build.json');

  if (existsSync(buildInfoFilePath)) {
    console.warn(`The build.json file already exists in the location: '${ buildInfoFilePath }'`);
  }

  console.log(`Write build.json to '${ buildInfoFilePath }' with content:`);
  console.log(JSON.stringify(buildJsonFile));

  writeFileSync(buildInfoFilePath, buildJsonFile);

  return {
    success: true,
  };
}
