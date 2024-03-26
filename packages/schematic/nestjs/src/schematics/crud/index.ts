import {
  chain,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { parse } from 'yaml';
import { CrudSchema } from './schema';

interface CrudDbConfig {
  name?: string;
  private?: string[];
  collections?: CrudDbConfig[];
}

function BuildCrudRule(config: CrudDbConfig, options: CrudSchema, parentCollectionList: string[]): Rule {

  const rules: Rule[] = [];

  if (config.name) {
    rules.push(() => console.log(`Create crud service for ${ config.name }`));
    rules.push(ExecuteSchematic('crud-service', {
      project: options.project,
      name: config.name,
      collection2: parentCollectionList,
      overwrite: !!options.overwrite,
    }));
  }

  if (config.private) {
    for (const privateName of config.private) {
      rules.push(() => console.log(`Create private crud service for ${ config.name } with private collection ${ privateName }`));
      rules.push(ExecuteSchematic('crud-service', {
        project: options.project,
        name: config.name,
        collection2: parentCollectionList,
        private: privateName,
        overwrite: !!options.overwrite,
      }));
    }
  }

  if (config.collections) {
    const subParentCollectionList = config.name ? [ ...parentCollectionList, config.name ] : parentCollectionList;
    for (const collection of config.collections) {
      rules.push(BuildCrudRule(collection, options, subParentCollectionList));
    }
  }

  return chain(rules);

}

export default function (options: CrudSchema): Rule {

  return async (host: Tree) => {

    const basePath = GetProjectSourceRoot(host, options.project);

    const dbYamlFilePath = join(basePath, 'db.yaml');

    if (!host.exists(dbYamlFilePath)) {
      throw new SchematicsException(`Ensure that the ${dbYamlFilePath} file exists in the src folder of the selected project.`);
    }

    const dbConfig = parse(host.read(dbYamlFilePath)!.toString('utf-8'));

    return BuildCrudRule(dbConfig, options, []);

  };

}
