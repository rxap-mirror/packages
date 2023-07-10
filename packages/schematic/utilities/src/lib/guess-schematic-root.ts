import {Tree} from '@angular-devkit/schematics';
import {join} from 'path';
import {GetProjectRoot} from './get-project';
import {GetProjectCollectionJson, HasProjectCollectionJsonFile} from './collection-json-file';

/**
 * Tries to guess the schematic root of a project.
 *
 * 1. check if a collection.json exists - else default
 * 2. check if the collection.json contains schematics - else default
 * 3. resolve based on the first found schematic config the schematics root folder - else default
 *
 * default: [projectRoot]/src/schematics
 *
 * @param host
 * @param projectName
 */
export function GuessSchematicRoot(host: Tree, projectName: string): string {

  const projectRoot = GetProjectRoot(host, projectName);

  if (HasProjectCollectionJsonFile(host, projectName)) {
    const collectionJson = GetProjectCollectionJson(host, projectName);

    if (Object.keys(collectionJson.schematics).length) {
      const firstSchematic = collectionJson.schematics[Object.keys(collectionJson.schematics)[0]];
      const basePathSegmentList: string[] = [];
      for (const segment of firstSchematic.factory.split('/')) {
        basePathSegmentList.push(segment);
        if (segment === 'schematics' || segment === 'schematic') {
          break;
        }
      }
      return join(projectRoot, basePathSegmentList.join('/'));
    }
  }

  console.warn('Could not guess the schematic root.');
  return join(projectRoot, 'src/schematics');

}
