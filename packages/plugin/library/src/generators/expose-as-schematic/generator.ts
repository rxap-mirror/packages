import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipNonGeneratorsProject,
  UpdateGenerators,
} from '@rxap/plugin-utilities';
import { UpdateProjectPackageJson } from '@rxap/workspace-utilities';
import {
  dirname,
  join,
} from 'path';
import { ExposeAsSchematicGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: ExposeAsSchematicGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonGeneratorsProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function exposeAsSchematicGenerator(
  tree: Tree,
  options: ExposeAsSchematicGeneratorSchema,
) {
  console.log('expose as schematic generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`expose as schematic for project: ${ projectName }`);

    UpdateGenerators(tree, project, (generators) => {

      generators.schematics ??= {};

      for (const [ name, generator ] of Object.entries(generators.generators)) {
        tree.write(
          join(project.root, dirname(generator.schema), 'index.ts'),
          `import { convertNxGenerator } from '@nx/devkit';\nimport generator from './generator';\nconst schematic = convertNxGenerator(generator);\nexport default schematic;\n`,
        );
        generators.schematics[name] = {
          factory: `${ dirname(generator.schema) }/index`,
          schema: generator.schema,
          description: generator.description,
        };
      }

      return generators;

    });

    await UpdateProjectPackageJson(tree, (packageJson) => {
      packageJson['schematics'] = packageJson['generators'];
    }, { projectName });

  }
}

export default exposeAsSchematicGenerator;
