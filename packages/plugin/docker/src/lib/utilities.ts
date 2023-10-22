import { ExecutorContext } from '@nx/devkit';
import { GetCurrentBranch } from '@rxap/node-utilities';
import { spawn } from 'child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
} from 'fs';
import {
  dirname,
  join,
} from 'path';
import { BuildExecutorSchema } from '../executors/build/schema';

export async function dockerLogin(command: string, registry: string, username: string, password: string) {

  const args = [
    `--password="${ password }"`,
    `--username="${ username }"`,
  ];

  args.push(registry);

  return new Promise((resolve, reject) => {
    const s = spawn(command, [ 'login', ...args ], { stdio: [ 0, 1, 2 ] });
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find ${ command }`);
      } else {
        reject(err);
      }
    });
    s.on('close', resolve);
  });

}

export async function dockerPush(command: string, tags: string[]) {

  if (!tags.length) {
    throw new Error('At least one tag must be specified');
  }

  return Promise.all(tags.map(tag => new Promise((resolve, reject) => {
    console.log(`${ command } push ${ tags.join(' ') }`);
    const s = spawn(command, [ 'push', ...tags ], { stdio: [ 0, 1, 2 ] });
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find ${ command }`);
      } else {
        reject(err);
      }
    });
    s.on('close', resolve);
  })));

}

export function processBuildArgs(
  buildArgList: string[] = [],
  projectName: string,
  projectSourceRoot: string,
  processEnv: Record<string, string> = process.env,
) {
  const processedBuildArgList: string[] = [];
  processedBuildArgList.push(`PROJECT_NAME=${ projectName }`);
  for (const buildArg of buildArgList) {
    if (buildArg.includes('=')) {
      const [ key, ...values ] = buildArg.split('=');
      let value = values.join('=');
      if (value.startsWith('REGEX:')) {
        const [ _, filePath, ...regexps ] = value.split(':');
        const regex = regexps.join(':');
        if (!filePath || !regex) {
          throw new Error(`Invalid regex build arg value '${ value }'`);
        }
        if (!existsSync(join(projectSourceRoot, filePath))) {
          throw new Error(`File '${ filePath }' does not exist in project source root '${ projectSourceRoot }'`);
        }
        const content = readFileSync(join(projectSourceRoot, filePath), 'utf-8');
        const match = content.match(new RegExp(regex));
        if (!match) {
          throw new Error(
            `Could not find match for regex '${ regex }' in file '${ filePath }' in project source root '${ projectSourceRoot }'`);
        }
        value = match[1] ?? match[0];
      }
      processedBuildArgList.push(`${ key }=${ value }`);
    } else if (processEnv[buildArg]) {
      processedBuildArgList.push(`${ buildArg }=${ processEnv[buildArg] }`);
    } else {
      console.warn(`Build arg value for '${ buildArg }' is not defined`);
    }
  }
  return processedBuildArgList;
}

export async function dockerBuild(
  command: string,
  context: string,
  destinationList: string[],
  dockerfile?: string,
  buildArgList?: string[],
) {

  const args: string[] = [];

  if (dockerfile) {
    args.push(`--file=${ dockerfile }`);
  }

  if (!destinationList.length) {
    throw new Error('At least one tag must be specified');
  }

  for (const destination of destinationList) {
    args.push(`--tag=${ destination }`);
  }

  if (buildArgList?.length) {
    for (const buildArg of buildArgList) {
      args.push(`--build-arg`);
      args.push(buildArg);
    }
  }

  args.push(context);

  return new Promise((resolve, reject) => {
    console.log(`${ command } build ${ args.join(' ') }`);
    const s = spawn(command, [ 'build', ...args ], { stdio: [ 0, 1, 2 ] });
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find command: '${ command }'`);
      } else {
        reject(err);
      }
    });
    s.on('close', resolve);
  });

}

export async function loginToRegistry(options: BuildExecutorSchema) {
  const username = process.env.REGISTRY_USER ?? process.env.CI_REGISTRY_USER;
  const password = process.env.REGISTRY_PASSWORD ?? process.env.CI_REGISTRY_PASSWORD;
  const registry = process.env.REGISTRY ?? process.env.CI_REGISTRY;
  if (username && password && registry) {
    await dockerLogin(options.command, registry, username, password);
  }
}

export async function getFallBackImageTag(context: ExecutorContext): Promise<string> {
  let imageTag = 'latest';
  try {
    imageTag = await GetCurrentBranch();
  } catch (e: any) {
    console.log('Could not get current branch:', e.message);
  }
  if (context.configurationName !== 'production') {
    imageTag = `${ imageTag }-${ context.configurationName ?? 'local' }`;
  }
  return imageTag.replace(/\//g, '-');
}

export function getGitlabRegistryDestination(
  options: {
    imageName?: string,
    imageSuffix?: string
  },
  fallbackImageName: string,
  imageTag?: string,
  fallbackImageTag?: string,
  imageName: string | undefined = options.imageName,
  imageSuffix: string | undefined = options.imageSuffix,
) {
  const registryImage = process.env.REGISTRY_IMAGE ??
    process.env.CI_REGISTRY_IMAGE ??
    options.imageName ??
    imageName ??
    fallbackImageName;
  const registryImageTag = imageTag ??
    process.env.REGISTRY_IMAGE_TAG ??
    process.env.VERSION ??
    process.env.CI_COMMIT_TAG ??
    process.env.CI_COMMIT_BRANCH ??
    fallbackImageTag ??
    'latest';
  return `${ registryImage }${ process.env.REGISTRY_IMAGE_SUFFIX ??
  options.imageSuffix ??
  imageSuffix ??
  '' }:${ registryImageTag }`;
}

export async function dockerSave(destinationList: string[], outputFile: string) {

  mkdirSync(dirname(outputFile), { recursive: true });

  const args: string[] = [
    'docker',
    'save',
    ...destinationList,
    '|',
    'gzip',
    '>',
    outputFile,
  ];

  const command = args.join(' ');

  return new Promise<void>((resolve, reject) => {
    const s = spawn('sh', [ '-c', command ], { stdio: [ 0, 1, 2 ] });
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not execute command: ${ command }`);
      } else {
        reject(err);
      }
    });
    s.on('close', () => {
      console.log(`docker image archive saved to '${ outputFile }'`);
      resolve();
    });
  });

}
