import { Tree } from '@nx/devkit';
import {
  CoercePrefix,
  CoerceSuffix,
} from '@rxap/utilities';
import { join } from 'path';
import {
  GetProject,
  GetProjectSourceRoot,
} from '../get-project';
import { RootDockerOptions } from '../get-root-docker-options';
import { ProcessBuildArgs } from '../process-build-args';

export function getServiceApiPrefixFromDockerFile(name: string, host: Tree): string | null {
  const projectSourceRoot = GetProjectSourceRoot(host, name);
  if (!projectSourceRoot) {
    throw new Error(`The project ${ name } has no source root!`);
  }
  const DockerFilePath = join(projectSourceRoot, 'Dockerfile');
  if (!host.exists(DockerFilePath)) {
    return null;
  }
  const dockerFile = host.read(DockerFilePath)!.toString('utf-8');
  const match = dockerFile.match(/ENV GLOBAL_API_PREFIX[\s=]"([^"]+)"/);
  if (!match) {
    return null;
  }
  const globalApiPrefix = match[1];
  return CoercePrefix(globalApiPrefix, '/');
}

export function getServiceApiPrefixFromAppConfig(name: string, host: Tree): string | null {
  const projectSourceRoot = GetProjectSourceRoot(host, name);
  if (!projectSourceRoot) {
    throw new Error(`The project ${ name } has no source root!`);
  }
  const appConfigFilePath = join(projectSourceRoot, 'app/app.config.ts');
  if (!host.exists(appConfigFilePath)) {
    return null;
  }
  const appConfig = host.read(appConfigFilePath)!.toString('utf-8');
  const match = appConfig.match(
    /validationSchema\['GLOBAL_API_PREFIX']\s*=\s*Joi.string\(\).default\(\s*'([^']+)',?\s*\);/);
  if (!match) {
    return null;
  }
  const globalApiPrefix = match[1];
  return CoercePrefix(globalApiPrefix, '/');
}

export function getServiceApiPrefixFromBuildArg(name: string, tree: Tree): string | null {
  const project = GetProject(tree, name);
  const projectSourceRoot = GetProjectSourceRoot(tree, name);
  if (!Array.isArray(project.targets?.['docker']?.options?.buildArgList)) {
    return null;
  }
  if (!project.targets['docker'].options.buildArgList.some((arg: string) => arg.startsWith('PATH_PREFIX='))) {
    return null;
  }
  const buildArgList = ProcessBuildArgs(
    project.targets['docker'].options.buildArgList,
    name,
    projectSourceRoot,
    { PROJECT_NAME: name },
    path => tree.exists(path),
    (path, encoding) => tree.read(path, encoding),
  );
  const pathPrefix = buildArgList.find((arg) => arg.startsWith('PATH_PREFIX='))!;
  return CoercePrefix(pathPrefix.split('=')[1], '/');
}

export function getServiceApiPrefix(name: string, host: Tree) {
  const globalApiPrefix = getServiceApiPrefixFromAppConfig(name, host) ?? getServiceApiPrefixFromBuildArg(name, host) ?? getServiceApiPrefixFromDockerFile(name, host);
  if (!globalApiPrefix) {
    console.warn(`The service ${ name } has no app.config.ts or the app.config.ts has no GLOBAL_API_PREFIX validation schema!`);
  }
  return CoerceSuffix(globalApiPrefix ?? '/api/' + name, '/', /\/$/);
}

export function getServicePortFromMain(tree: Tree, projectName: string): string | null {
  const sourceRoot = GetProjectSourceRoot(tree, projectName);
  if (!sourceRoot) {
    return null;
  }
  const mainFilePath = join(sourceRoot, 'main.ts');
  if (!tree.exists(mainFilePath)) {
    return null;
  }
  const main = tree.read(mainFilePath)!.toString('utf-8');
  const portMatch = main.match(/process.env.PORT \?\? (\d+)/);
  if (!portMatch) {
    return null;
  }
  return portMatch[1];
}

export function getServicePortFromAppConfig(tree: Tree, projectName: string): string | null {
  const sourceRoot = GetProjectSourceRoot(tree, projectName);
  if (!sourceRoot) {
    return null;
  }
  const appModuleFilePath = join(sourceRoot, 'app', 'app.config.ts');
  if (!tree.exists(appModuleFilePath)) {
    return null;
  }
  const appModule = tree.read(appModuleFilePath)!.toString('utf-8');
  const portMatch = appModule.match(
    /validationSchema\['PORT']\s*=\s*Joi.number\(\).default\((\d+)\)/,
  );
  if (!portMatch) {
    return null;
  }
  return portMatch[1];
}

export function getServicePort(tree: Tree, projectName: string, defaultPort = '3000') {
  const port = getServicePortFromMain(tree, projectName) ?? getServicePortFromAppConfig(tree, projectName);
  if (!port) {
    console.warn(`The service ${ projectName } has no PORT environment variable!`);
  }
  return port ?? defaultPort;
}

export function buildImageName(docker: Record<string, string>, rootDocker: RootDockerOptions, envExpression = false): string {
  const imageRegistry = `${ docker['imageRegistry'] ?? rootDocker.imageRegistry ?? 'registry.gitlab.com' }`;
  const imageName = `${ docker['imageName'] ?? rootDocker.imageName ?? 'unknown' }${ docker['imageSuffix'] ?? '' }`;
  const imageTag = `development`;

  if (envExpression) {
    return `\${REGISTRY:-${ imageRegistry }}/${ imageName }:\${CHANNEL:-${ imageTag }}`;
  }

  return `${ imageRegistry }/${ imageName }:${ imageTag }`;
}
