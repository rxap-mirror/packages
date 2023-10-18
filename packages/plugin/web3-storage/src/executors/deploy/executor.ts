import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPathFromTargetString } from '@rxap/plugin-utilities';
import {
  FileLike,
  filesFromPaths,
} from 'files-from-path';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { Web3Storage } from 'web3.storage';
import { DeployExecutorSchema } from './schema';

export default async function runExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for Deploy', options);

  const token = options.token ?? process.env.WEB3_STORAGE_TOKEN;

  if (!token) {
    console.error('No token provided. Use the command parameter --token or set the environment variable WEB3_STORAGE_TOKEN');
    return {
      success: false,
    };
  }

  const outputPath = GuessOutputPathFromTargetString(context, options.buildTarget);

  console.log(`Build file list from '${outputPath}'`);
  let fileList: FileLike[];
  try {
    fileList = await filesFromPaths([ outputPath ]);
  } catch (e: any) {
    console.error(`Error building file list: ${ e.message }`);
    return {
      success: false,
    };
  }

  console.log('Create web3 storage client');
  let web3Storage: Web3Storage;
  try {
    web3Storage = new Web3Storage({
      token: token,
      rateLimiter: options.rateLimit ? () => new Promise(resolve => setTimeout(resolve, options.rateLimit)) : undefined,
      endpoint: options.endpoint ? new URL(options.endpoint) : undefined,
    });
  } catch (e: any) {
    console.error(`Error creating web3 storage client: ${ e.message }`);
    return {
      success: false,
    };
  }

  console.log('Upload file list to web3 storage');
  let cid: string;
  try {
    cid = await web3Storage.put(fileList);
  } catch (e: any) {
    console.error(`Error uploading file list to web3 storage: ${ e.message }`);
    return {
      success: false,
    };
  }

  console.log('====================================');
  console.log(`Upload successful.`);
  console.log(`CID: "${ cid }"`);
  console.log('====================================');

  try {
    writeFileSync(join(outputPath, 'ipfs-cid.txt'), cid);
  } catch (e: any) {
    console.error(`Error writing ipfs cid to file: ${ e.message }`);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
