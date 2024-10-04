import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPathFromTargetString } from '@rxap/plugin-utilities';
import {
  FileLike,
  filesFromPaths,
} from 'files-from-path';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as Client from '@web3-storage/w3up-client';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@ucanto/principal/ed25519';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import { DeployExecutorSchema } from './schema';
import { AnyLink } from '@web3-storage/w3up-client/dist/src/types';

async function createClient(key: string, proofStr: string) {

  console.log('Creating client...');

  // Load client with specific private key
  const principal = Signer.parse(key);
  const store = new StoreMemory();
  const client = await Client.create({
    principal,
    store,
  });
  console.log('Client created');
  console.log('Adding proof...');
  // Add proof that this agent has been delegated capabilities on the space
  const proof = await Proof.parse(proofStr);
  console.log('Proof parsed');
  const space = await client.addSpace(proof);
  console.log('proof added');
  await client.setCurrentSpace(space.did());
  console.log('Space set');
  // READY to go!
  return client;
}

export default async function runExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for Deploy', options);

  const key = options.key ?? process.env.WEB3_STORAGE_KEY;
  const proof = options.proof ?? process.env.WEB3_STORAGE_PROOF;

  if (!key) {
    console.error('No key provided. Use the command parameter --key or set the environment variable WEB3_STORAGE_KEY');
    return {
      success: false,
    };
  }

  if (!proof) {
    console.error('No proof provided. Use the command parameter --proof or set the environment variable WEB3_STORAGE_PROOF');
    return {
      success: false,
    };
  }

  const outputPath = join(context.root, GuessOutputPathFromTargetString(context, options.buildTarget));

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
  let client: Client.Client;
  try {
    client = await createClient(key, proof);
  } catch (e: any) {
    console.error(`Error creating client: ${ e.message }`);
    return {
      success: false,
    };
  }

  console.log('Upload file list to web3 storage');
  let cid: AnyLink;
  try {
    cid = await client.uploadDirectory(fileList);
  } catch (e: any) {
    console.error(`Error uploading file list to web3 storage: ${ e.message }`);
    return {
      success: false,
    };
  }

  console.log('====================================');
  console.log(`Upload successful.`);
  console.log(`CID: "${ cid.toString() }"`);
  console.log(`URL: https://${ cid.toString() }.ipfs.w3s.link`);
  console.log(`Explore: https://explore.ipld.io/#/explore/${ cid.toString() }`);
  console.log('====================================');

  try {
    writeFileSync(join(outputPath, 'ipfs-cid.txt'), cid.toString());
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
