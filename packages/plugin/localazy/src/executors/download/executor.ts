import { YarnRun } from '@rxap/plugin-utilities';
import { DownloadExecutorSchema } from './schema';

export default async function runExecutor(options: DownloadExecutorSchema) {

  if (process.env.LOCALAZY_WRITE_KEY) {
    options.writeKey = process.env.LOCALAZY_WRITE_KEY;
  }

  if (process.env.LOCALAZY_READ_KEY) {
    options.readKey = process.env.LOCALAZY_READ_KEY;
  }

  const args: string[] = [ 'localazy', 'download' ];

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

  if (options.tag) {
    args.push('-t ' + options.tag);
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
