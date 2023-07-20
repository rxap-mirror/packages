import { ConfigExecutorSchema } from './schema';
import {
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import { ExecutorContext } from '@nx/devkit';

function createFileName(key: string): string {
  const match = key.match(/^RXAP_CONFIG_(.*)/);
  if (match) {
    const name = match[1].toLowerCase().replace(/_/g, '.');
    return [ 'config', name, 'json' ].join('.');
  }
  return 'config.json';
}

function createConfigContent(key: string) {
  if (key.match(/^RXAP_CONFIG/)) {
    const value = process.env[key];
    if (value) {
      let content: string;
      if (value.match(/^(\/[^/\s]*)+\/?$/)) {
        content = readFileSync(value).toString('utf-8');
      } else {
        content = value;
      }
      try {
        JSON.parse(content);
      } catch (e: any) {
        throw new Error(`Can not parse config from '${ key }': ${ content }`);
      }
      return content;
    }
  } else {
    throw new Error(`Can not create config from '${ key }'. Env name does not start with 'RXAP_CONFIG'`);
  }
}

export default async function runExecutor(
  options: ConfigExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for Config', options);

  const outputPath = GuessOutputPath(context);

  for (const key of Object.keys(process.env)) {
    if (key.match(/^RXAP_CONFIG/)) {
      try {
        const content = createConfigContent(key);
        console.info(`Add config '${ key }'`);
        writeFileSync(join(outputPath, createFileName(key)), content);
      } catch (e) {
        console.error(e.message);
        return {
          success: false,
          error: e.message,
        };
      }
    }
  }

  return {
    success: true,
  };
}
