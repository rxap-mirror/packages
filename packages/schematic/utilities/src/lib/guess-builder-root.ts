import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { GetProjectRoot } from './get-project';
import { GetProjectBuildersJson } from './builders-json-file';

/**
 * Tries to guess the builder root of a project.
 *
 * 1. check if a builders.json exists - else default
 * 2. check if the builders.json contains builder - else default
 * 3. resolve based on the first found builder config the builders root folder - else default
 *
 * default: [projectRoot]/src/builders
 *
 * @param host
 * @param projectName
 */
export function GuessBuilderRoot(host: Tree, projectName: string): string {

  const builderJson = GetProjectBuildersJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  if (Object.keys(builderJson.builders).length) {
    const firstSchematic = builderJson.builders[Object.keys(builderJson.builders)[0]];
    const basePathSegmentList: string[] = [];
    for (const segment of firstSchematic.schema.split('/')) {
      basePathSegmentList.push(segment);
      if (segment === 'builders' || segment === 'builders') {
        break;
      }
    }
    return join(projectRoot, basePathSegmentList.join('/'));
  }

  console.warn('Could not guess the builder root.');
  return join(projectRoot, 'src/builders');

}
