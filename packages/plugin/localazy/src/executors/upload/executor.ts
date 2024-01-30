import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectConfiguration,
  GetTarget,
  GetTargetOptions,
  YarnRun,
} from '@rxap/plugin-utilities';
import * as process from 'process';
import { GetAutoTag } from '../../lib/get-auto-tag';
import { LoadKeysFromFile } from '../../lib/load-keys-from-file';
import { NormalizeTag } from '../../lib/normalize-tag';
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

  if (!options.readKey || !options.writeKey) {
    const fromFile = LoadKeysFromFile(context.projectName);
    options.readKey ??= fromFile.read;
    options.writeKey ??= fromFile.write;
  }

  if (!options.writeKey) {
    console.log('The write key is not set');
    if (!process.env.CI) {
      console.log('Detecting a non CI environment. Exit with success');
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Could not find write key',
    };
  }

  if (!options.readKey) {
    console.log('The read key is not set');
    return {
      success: false,
      error: 'Could not find read key',
    };
  }

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

  if (options.tag) {
    options.tag = NormalizeTag(options.tag);
    try {
      const args = [ 'localazy', 'tag' ];
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
      args.push('publish', options.tag);
      console.log('Publish tag', options.tag);
      await YarnRun(args);
    } catch (e: any) {
      console.error(`Could not run 'localazy tag publish ${ options.tag }'`, e.message);
      return {
        success: false,
        error: e.message,
      };
    }
  } else {
    console.log('Skip tag publish');
  }

  return {
    success: true,
  };
}
