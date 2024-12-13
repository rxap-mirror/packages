import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPathFromContext } from '@rxap/plugin-utilities';
import {
  deepMerge,
  SetToObject,
} from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { ConfigExecutorSchema } from './schema';
import 'colors';

function getContent(key: string) {
  const value = process.env[key];
  if (value) {
    let content: string;
    if (value.match(/^(\/[^/\s]*)+\/?$/)) {
      content = readFileSync(value).toString('utf-8');
    } else {
      content = value;
    }
    try {
      return JSON.parse(content);
    } catch (e: any) {
      throw new Error(`Can not parse config from '${ key }': ${ content }`);
    }
  }
}


export default async function runExecutor(
  options: ConfigExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for Config', options);

  const outputPath = GuessOutputPathFromContext(context);

  let config: any = {};
  const configPath = join(outputPath, 'config.json');
  if (existsSync(configPath)) {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  for (const key of Object.keys(process.env).filter(key => !!key && key.startsWith('RXAP_CONFIG')).sort((a, b) => a.length - b.length)) {
    try {
      const content = getContent(key);
      const match = key.match(/^RXAP_CONFIG_(.*)/);
      if (match) {
        const key = match[1].toLowerCase().replace(/_/g, '.');
        console.log(`Set config '${ key }'`.grey);
        SetToObject(config, key, content);
      } else {
        console.log('Merge config'.grey);
        deepMerge(config, content);
      }
    } catch (e: any) {
      console.error(e.message);
      return {
        success: false,
        error: e.message,
      };
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));

  return {
    success: true,
  };
}
