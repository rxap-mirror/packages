import { spawn } from 'child_process';
import { BuildExecutorSchema } from './build/schema';

export async function dockerLogin(command: string, registry: string, username: string, password: string) {

  const args = [
    `--password="${ password }"`,
    `--username="${ username }"`,
  ];

  args.push(registry);

  return new Promise((resolve, reject) => {
    const s = spawn(command, ['login', ...args], {stdio: [0, 1, 2]});
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find ${command}`);
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
    console.log(`${command} push ${tags.join(' ')}`);
    const s = spawn(command, ['push', ...tags], {stdio: [0, 1, 2]});
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find ${command}`);
      } else {
        reject(err);
      }
    });
    s.on('close', resolve);
  })));

}

export async function dockerBuild(command: string, context: string, destinationList: string[], dockerfile?: string) {

  const args: string[] = [];

  if (dockerfile) {
    args.push(`--file="${dockerfile}"`)
  }

  if (!destinationList.length) {
    throw new Error('At least one tag must be specified');
  }

  for (const destination of destinationList) {
    args.push(`--tag=${destination}`);
  }

  args.push(context);

  return new Promise((resolve, reject) => {
    console.log(`${command} build ${args.join(' ')}`);
    const s = spawn(command, ['build', ...args], {stdio: [0, 1, 2]});
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not find ${command}`);
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

export function getGitlabRegistryDestination(options: {
  imageName?: string,
  imageSuffix?: string
}, fallbackImageName?: string, imageTag?: string, fallbackImageTag?: string, imageName?: string, imageSuffix?: string) {
  const registryImage = process.env.REGISTRY_IMAGE ?? process.env.CI_REGISTRY_IMAGE ?? options.imageName ?? imageName ?? fallbackImageName;
  const registryImageTag = imageTag ?? process.env.REGISTRY_IMAGE_TAG ?? process.env.VERSION ?? process.env.CI_COMMIT_TAG ?? process.env.CI_COMMIT_BRANCH ?? fallbackImageTag ?? 'latest';
  return `${registryImage}${process.env.REGISTRY_IMAGE_SUFFIX ?? options.imageSuffix ?? imageSuffix ?? ''}:${registryImageTag}`;
}

export async function dockerSave(destinationList: string[], outputName: string) {

  const args: string[] = [
    'docker',
    'save',
    ...destinationList,
    '|',
    'gzip',
    '>',
    `${outputName}.tar.gz`,
  ];

  const command = args.join(' ');

  return new Promise((resolve, reject) => {
    const s = spawn('sh', ['-c', command], {stdio: [0, 1, 2]});
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`Could not execute command: ${command}`);
      } else {
        reject(err);
      }
    });
    s.on('close', resolve);
  });

}
