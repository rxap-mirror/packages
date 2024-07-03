import { CoercePrefix } from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';

export function ProcessBuildArgs(
  buildArgList: string[] = [],
  projectName: string,
  projectSourceRoot: string,
  processEnv: Record<string, unknown> = process.env,
  existsFileFn: (path: string) => boolean = existsSync,
  readFileSyncFn: (path: string, encoding: BufferEncoding) => string | null = readFileSync,
) {
  const processedBuildArgList: string[] = [];
  processedBuildArgList.push(`PROJECT_NAME=${ projectName }`);
  processedBuildArgList.push(`RELEASE=$CI_COMMIT_REF_NAME`);
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
        if (!existsFileFn(join(projectSourceRoot, filePath))) {
          throw new Error(`File '${ filePath }' does not exist in project source root '${ projectSourceRoot }'`);
        }
        const content = readFileSyncFn(join(projectSourceRoot, filePath), 'utf-8')!;
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
  const pathPrefixBuildArgIndex = processedBuildArgList.findIndex((arg) => arg.startsWith('PATH_PREFIX='));
  if (pathPrefixBuildArgIndex !== -1) {
    const pathPrefixBuildArg = processedBuildArgList[pathPrefixBuildArgIndex];
    let pathPrefix = pathPrefixBuildArg.split('=')[1];
    if (pathPrefix) {
      pathPrefix = CoercePrefix(pathPrefix, '/');
    }
    if (!pathPrefix || pathPrefix === '/') {
      processedBuildArgList.splice(pathPrefixBuildArgIndex, 1);
    } else {
      processedBuildArgList[pathPrefixBuildArgIndex] = `PATH_PREFIX=${ pathPrefix }`;
    }
  }
  return processedBuildArgList;
}
