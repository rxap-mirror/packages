import { Tree } from '@nx/devkit';
import {
  camelize,
  CoerceArrayItems,
} from '@rxap/utilities';
import {
  CoerceFile,
  GetGenerators,
  GetPackageJson,
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { IndexJsonSchemaGeneratorSchema } from './schema';

function getSchematicMap(tree: Tree, options: IndexJsonSchemaGeneratorSchema) {
  const { generators, schematics } = GetGenerators(tree, options.project);
  const generatorMapList = Object.entries(generators ?? {});
  CoerceArrayItems(generatorMapList, Object.entries(schematics ?? {}), (a, b) => a[0] === b[0]);
  return generatorMapList;
}

function generateSchematicInputSchema(tree: Tree, options: IndexJsonSchemaGeneratorSchema) {
  const schemaList: any[] = [];
  const projectRoot = GetProjectRoot(tree, options.project);
  const packageJsonName = GetPackageJson(tree, projectRoot).name;
  const generatorMapList = getSchematicMap(tree, options);
  for (const [name, { schema }] of generatorMapList) {
    const schemaPath = dirname(schema);
    const schemaTemplatePath = './' + join(schemaPath, 'template.schema.json');
    let schemaRefPath: string;
    if (tree.exists(join(projectRoot, schemaTemplatePath))) {
      schemaRefPath = schemaTemplatePath;
    } else {
      schemaRefPath = schema;
    }
    const schemaFileContent = tree.read(join(projectRoot, schemaRefPath));
    if (schemaFileContent === null) {
      // the generator has neither a template.schema.json nor a schema.json. See GenerateSchematicDefinitionsMap
      continue;
    }
    const content = JSON.parse(schemaFileContent.toString());
    schemaRefPath = schemaRefPath.replace(/^\.\/[^/]+\//, './');
    schemaList.push({
      type: 'object',
      properties: {
        package: {
          type: "string",
          const: packageJsonName,
        },
        name: {
          type: "string",
          const: name,
        },
        options: {
          $ref: `#/definitions/${camelize(content.$id)}`,
        }
      }
    });
  }
  return {
    $schema: 'http://json-schema.org/schema',
    $id: 'schematic-input',
    type: 'object',
    oneOf: schemaList,
    definitions: GenerateSchematicDefinitionsMap(tree, options)
  };
}

export function GenerateSchematicDefinitionsMap(tree: Tree, options: IndexJsonSchemaGeneratorSchema, basePath = './src') {
  const projectRoot = GetProjectRoot(tree, options.project);
  const generatorMapList = getSchematicMap(tree, options);
  const definitions: Record<string, { $ref: string }> = {};
  for (const [, { schema }] of generatorMapList) {
    const schemaPath = dirname(schema);
    const schemaTemplatePath = join(schemaPath, 'template.schema.json');
    let schemaRefPath: string;
    if (tree.exists(join(projectRoot, schemaTemplatePath))) {
      schemaRefPath = schemaTemplatePath;
    } else {
      schemaRefPath = schema;
    }
    // A collection entry may point to a generator that has no template.schema.json
    // and no (yet generated) schema.json on disk (e.g. an `init` generator exposed
    // in collection.json). Skip it instead of crashing on a null read.
    const schemaFileContent = tree.read(join(projectRoot, schemaRefPath));
    if (schemaFileContent === null) {
      console.warn(`Skipping schematic definition: neither '${ schemaTemplatePath }' nor '${ schema }' exists under '${ projectRoot }'.`);
      continue;
    }
    const content = JSON.parse(schemaFileContent.toString());
    definitions[camelize(content.$id)] = {
      $ref: relative(basePath, schemaRefPath)
    };
  }
  return definitions;
}

export function GenerateDefinitionsMap(tree: Tree, options: IndexJsonSchemaGeneratorSchema, basePath = './src') {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const schematicsFolder = join(projectSourceRoot, 'schematics');
  const definitions: Record<string, { $ref: string }> = GenerateSchematicDefinitionsMap(tree, options, basePath);
  for (const schematic of tree.children(schematicsFolder)) {
    if (schematic.endsWith('schema.json')) {
      const schema = JSON.parse(tree.read(join(schematicsFolder, schematic))!.toString());
      definitions[camelize(schema.$id)] = {
        $ref: relative(basePath, `./src/schematics/${schematic}`)
      };
    }
  }
  return definitions;
}

function generateTemplateSchema(tree: Tree, options: IndexJsonSchemaGeneratorSchema) {
  const definitions = GenerateDefinitionsMap(tree, options);
  definitions['schematicInput'] = {
    $ref: './schematic-input.schema.json',
  };
  return {
    $schema: 'http://json-schema.org/schema',
    $id: 'schematic-angular',
    oneOf: [
      {
        type: 'array',
        items: {
          $ref: '#/definitions/schematicInput'
        }
      },
      {
        $ref: '#/definitions/schematicInput'
      }
    ],
    definitions
  };
}

export async function indexJsonSchemaGenerator(
  tree: Tree,
  options: IndexJsonSchemaGeneratorSchema
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  CoerceFile(tree, join(projectSourceRoot, 'schematic-input.schema.json'), JSON.stringify(generateSchematicInputSchema(tree, options), null, 2), true);
  CoerceFile(tree, join(projectSourceRoot, 'template.schema.json'), JSON.stringify(generateTemplateSchema(tree, options), null, 2), true);
}

export default indexJsonSchemaGenerator;
