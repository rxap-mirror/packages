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
    args.push('-r ' + options.readKey);
  }

  if (options.writeKey) {
    args.push('-w ' + options.writeKey);
  }

  if (options.configJson) {
    args.push('-c "' + options.configJson + '"');
  }

  if (options.workingDirectory) {
    args.push('-d "' + options.workingDirectory + '"');
  }

  if (options.keysJson) {
    args.push('-k "' + options.keysJson + '"');
  }

  if (options.version) {
    args.push('-v ' + options.version);
  }

  if (options.dryRun) {
    args.push('-s');
  }

  if (options.quite) {
    args.push('-q');
  }

  if (options.force) {
    args.push('-f');
  }

  try {
    await YarnRun(args);
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    };
  }

  return {
    success: true,
  };
}
