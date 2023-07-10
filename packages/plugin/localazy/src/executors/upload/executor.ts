import { UploadExecutorSchema } from './schema';
import {
  GetProjectConfiguration,
  GetTarget,
  GetTargetOptions,
  YarnRun,
} from '@rxap/plugin-utilities';
import { ExecutorContext } from '@nx/devkit';
import { DownloadExecutorSchema } from '../download/schema';

export default async function runExecutor(options: UploadExecutorSchema, context: ExecutorContext) {

  if (process.env.LOCALAZY_WRITE_KEY) {
    options.writeKey = process.env.LOCALAZY_WRITE_KEY;
  }

  if (process.env.LOCALAZY_READ_KEY) {
    options.readKey = process.env.LOCALAZY_READ_KEY;
  }

  if (!options.readKey) {
    const projectConfiguration = GetProjectConfiguration(context);
    const downloadTarget = GetTarget(projectConfiguration, 'localazy-download');
    const downloadTargetOptions = GetTargetOptions<DownloadExecutorSchema>(downloadTarget, context.configurationName);
    options.readKey = downloadTargetOptions.readKey;
  }

  const args: string[] = [ 'localazy', 'upload' ];

  if (this.options.readKey) {
    args.push('-r ' + this.options.readKey);
  }

  if (this.options.writeKey) {
    args.push('-w ' + this.options.writeKey);
  }

  if (this.options.configJson) {
    args.push('-c "' + this.options.configJson + '"');
  }

  if (this.options.workingDirectory) {
    args.push('-d "' + this.options.workingDirectory + '"');
  }

  if (this.options.keysJson) {
    args.push('-k "' + this.options.keysJson + '"');
  }

  if (this.options.version) {
    args.push('-v ' + this.options.version);
  }

  if (this.options.dryRun) {
    args.push('-s');
  }

  if (this.options.quite) {
    args.push('-q');
  }

  if (this.options.force) {
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
