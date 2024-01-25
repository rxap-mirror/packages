import { YarnRun } from '@rxap/plugin-utilities';
import { GetAutoTag } from '../../lib/get-auto-tag';
import { DownloadExecutorSchema } from './schema';

export default async function runExecutor(options: DownloadExecutorSchema) {

  if (process.env.LOCALAZY_WRITE_KEY) {
    options.writeKey = process.env.LOCALAZY_WRITE_KEY;
  }

  if (process.env.LOCALAZY_READ_KEY) {
    options.readKey = process.env.LOCALAZY_READ_KEY;
  }

  const args: string[] = [ 'localazy', 'download' ];

  if (options.autoTag) {
    console.log('Get auto tag');
    const tag = GetAutoTag();
    if (tag) {
      console.log('Set auto tag', tag);
      options.tag = tag;
    } else {
      console.log('Could not get auto tag');
    }
  } else {
    console.log('Skip auto tag');
  }

  if (options.readKey) {
    args.push(`--read-key ${ options.readKey }`);
  }

  if (options.writeKey) {
    args.push(`--write-key ${ options.writeKey }`);
  }

  if (options.configJson) {
    args.push(`--config "${ options.configJson }"`);
  }

  if (options.workingDirectory) {
    args.push(`--working-dir "${ options.workingDirectory }"`);
  }

  if (options.keysJson) {
    args.push(`--keys "${ options.keysJson }"`);
  }

  if (options.tag) {
    args.push(`--tag ${ options.tag }`);
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

  try {
    await YarnRun(args);
  } catch (e: any) {
    console.error(`Could not run 'localazy download'`, e.message);
    return {
      success: false,
      error: e.message,
    };
  }

  return {
    success: true,
  };
}
