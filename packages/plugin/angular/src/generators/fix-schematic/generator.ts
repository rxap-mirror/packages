import { Tree } from '@nx/devkit';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
  VisitTree,
} from '@rxap/generator-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { FixSchematicGeneratorSchema } from './schema';

export async function fixSchematicGenerator(
  tree: Tree,
  options: FixSchematicGeneratorSchema,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  const schematicsSourceRoot = join(GetProjectSourceRoot(tree, options.project), 'schematics');

  if (!tree.exists(schematicsSourceRoot)) {
    console.warn(`The schematics source root ${ schematicsSourceRoot } does not exists!`);
    return;
  }

  const packageJson = JSON.parse(tree.read(join(projectRoot, 'package.json')).toString('utf-8'));

  if (!packageJson.schematics) {
    console.warn(`The package.json file does not contains schematics property!`);
    return;
  }

  const collectionFile = join(projectRoot, packageJson.schematics);

  if (!tree.exists(collectionFile)) {
    console.warn(`The collection file ${ collectionFile } does not exists!`);
    return;
  }

  const collection = JSON.parse(tree.read(collectionFile).toString('utf-8'));

  collection.schematics ??= {};

  const { schematics } = collection;

  const detectedSchemaJsonFiles: string[] = [];

  for (const {
    path,
    isFile
  } of VisitTree(tree, schematicsSourceRoot)) {
    if (isFile && path.endsWith('schema.json')) {
      detectedSchemaJsonFiles.push('./' + relative(projectRoot, path));
    }
  }

  const notDefinedSchematics: string[] = detectedSchemaJsonFiles
    .filter(schemaJsonFile =>
      !Object.values(schematics)
             .some((schematic: any) => schematic.schema === schemaJsonFile),
    );

  console.log(`Not defined schematics: ${ notDefinedSchematics.length }`);
  if (notDefinedSchematics.length) {
    console.log(` - ${ notDefinedSchematics.join('\n - ') }`);
  } else {
    console.log('All schematics are defined');
  }

  for (const schemaJsonFile of notDefinedSchematics) {
    const basePath = dirname(schemaJsonFile);
    const schematicName = basePath.split('/').pop()!;
    if (schematics[schematicName]) {
      console.warn(`The schematic ${ schematicName } is already defined!`);
      continue;
    }
    schematics[schematicName] = {
      schema: schemaJsonFile,
      factory: `${ basePath }/index`,
    };
  }

  for (const [ name, schematic ] of Object.entries(schematics)) {
    schematic['description'] ??= `The ${ name } schematic`;
  }

  console.log('Update collection file');
  tree.write(collectionFile, JSON.stringify(collection, null, 2));

}

export default fixSchematicGenerator;
