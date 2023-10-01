import { ExecutorContext } from '@nx/devkit';
import { CopyFolderSync } from '@rxap/node-utilities';
import { GetProjectSourceRoot } from '@rxap/plugin-utilities';
import {
  existsSync,
  mkdirSync,
  rmSync,
} from 'fs';
import { join } from 'path';
import { CopyClientSdkExecutorSchema } from './schema';

const GENERIC_SOURCE_FILE_FOLDER = [
  'parameters',
  'responses',
  'request-bodies',
  'components',
];

const ANGULAR_SOURCE_FILE_FOLDER = [
  'data-sources',
  'remote-methods',
  'directives',
];

const NEST_JS_SOURCE_FILE_FOLDER = [
  'commands',
];

function getAngularSourceFileFolder(options: CopyClientSdkExecutorSchema) {
  const copy = [ ...ANGULAR_SOURCE_FILE_FOLDER ];
  if (options.skipDataSources) {
    copy.splice(copy.indexOf('data-sources'), 1);
  }
  if (options.skipDirectives) {
    copy.splice(copy.indexOf('directives'), 1);
  }
  if (options.skipRemoteMethods) {
    copy.splice(copy.indexOf('remote-methods'), 1);
  }
  return copy;
}

function clearOutputDir(options: CopyClientSdkExecutorSchema, context: ExecutorContext) {
  const projectSourceRoot = GetProjectSourceRoot(context);
  // if the output dir exists
  if (existsSync(join(projectSourceRoot, 'lib', options.outputDir))) {
    // then remove the directory recursively
    rmSync(
      join(projectSourceRoot, 'lib', options.outputDir), {
        recursive: true,
        force: true,
      });
  }
  mkdirSync(join(projectSourceRoot, 'lib', options.outputDir), { recursive: true });
}

function copyFolder(options: CopyClientSdkExecutorSchema, context: ExecutorContext, folderName: string) {
  const sourceProjectSourceRoot = GetProjectSourceRoot(context, options.clientSdkProject);
  const targetProjectSourceRoot = GetProjectSourceRoot(context);
  const sourceFolderPath = join(sourceProjectSourceRoot, 'lib', folderName);
  const targetFolderPath = join(targetProjectSourceRoot, 'lib', options.outputDir, folderName);
  if (!existsSync(sourceFolderPath)) {
    console.log(
      `Skip copy folder '${ folderName }' from '${ sourceFolderPath }' to '${ targetFolderPath }' because the source folder does not exists`);
  } else {
    console.log(`Copy folder '${ folderName }' from '${ sourceFolderPath }' to '${ targetFolderPath }'`);
    CopyFolderSync(sourceFolderPath, targetFolderPath);
  }
}

export default async function runExecutor(
  options: CopyClientSdkExecutorSchema,
  context: ExecutorContext,
) {

  // the directives have a direct dependency to the remote methods
  if (options.skipRemoteMethods && !options.skipDirectives) {
    // if the skip remote methods is set but not the skip directives
    // then enforce that remote methods are not skipped
    options.skipRemoteMethods = false;
  }

  console.log('Executor ran for CopyClientSdk', options);

  if (!context.projectsConfigurations.projects[options.clientSdkProject]) {
    throw new Error(`Could not find project '${ options.clientSdkProject }'`);
  }

  clearOutputDir(options, context);

  for (const folderName of GENERIC_SOURCE_FILE_FOLDER) {
    copyFolder(options, context, folderName);
  }

  if (options.angular) {
    for (const folderName of getAngularSourceFileFolder(options)) {
      copyFolder(options, context, folderName);
    }
  }

  if (options.nestJs) {
    for (const folderName of NEST_JS_SOURCE_FILE_FOLDER) {
      copyFolder(options, context, folderName);
    }
  }

  return {
    success: true,
  };
}
