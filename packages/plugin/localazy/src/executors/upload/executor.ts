import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectConfiguration,
  GetTarget,
  GetTargetOptions,
  YarnRun,
} from '@rxap/plugin-utilities';
import { DownloadExecutorSchema } from '../download/schema';
import { UploadExecutorSchema } from './schema';

export default async function runExecutor(options: UploadExecutorSchema, context: ExecutorContext) {

  if (process.env.LOCALAZY_WRITE_KEY) {
    options.writeKey = process.env.LOCALAZY_WRITE_KEY;
  }

  if (process.env.LOCALAZY_READ_KEY) {
    options.readKey = process.env.LOCALAZY_READ_KEY;
  }

  const projectConfiguration = GetProjectConfiguration(context);
  const downloadTarget = GetTarget(projectConfiguration, 'localazy-download');
  const downloadTargetOptions = GetTargetOptions<DownloadExecutorSchema>(downloadTarget, context.configurationName);
  options.readKey ??= downloadTargetOptions.readKey;
  options.writeKey ??= downloadTargetOptions.writeKey;
  options.configJson ??= downloadTargetOptions.configJson;
  options.workingDirectory ??= downloadTargetOptions.workingDirectory;
  options.keysJson ??= downloadTargetOptions.keysJson;

  const args: string[] = [ 'localazy', 'upload' ];

  if (options.readKey) {
    args.push('--read-key ' + options.readKey);
  }

  if (options.writeKey) {
    args.push('--write-key ' + options.writeKey);
  }

  if (options.configJson) {
    args.push('--config "' + options.configJson + '"');
  }

  if (options.workingDirectory) {
    args.push('--working-dir "' + options.workingDirectory + '"');
  }

  if (options.keysJson) {
    args.push('--keys "' + options.keysJson + '"');
  }

  if (options.version) {
    args.push('--app-version ' + options.version);
  }

  if (options.dryRun) {
    args.push('--simulate');
  }

  if (options.quite) {
    args.push('--quiet');
  }

  if (options.force) {
    args.push('--force');
  }

  if (options.branch) {
    args.push(`--branch ${ options.branch }`);
  }

  if (options.param) {
    args.push(`--param ${ options.param }`);
  }

  if (options.failOnMissingGroups) {
    args.push('--failOnMissingGroups');
  }

  if (options.project) {
    args.push('--project ' + options.project);
  }

  if (options.async) {
    args.push('--async');
  }

  if (options.disableContentLength) {
    args.push('--disable-content-length');
  }

  try {
    await YarnRun(args);
  } catch (e: any) {
    console.error(`Could not run 'localazy upload'`, e.message);
    return {
      success: false,
      error: e.message,
    };
  }

  return {
    success: true,
  };
}
