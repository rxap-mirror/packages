import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { ProjectTargetGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: ProjectTargetGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  return false;

}

export async function projectTargetGenerator(
  tree: Tree,
  options: ProjectTargetGeneratorSchema,
) {
  console.log('workspace project target generator:', options);

  const nxJson = readNxJson(tree);
  if (!nxJson) {
    throw new Error('Cannot find nx.json');
  }
  const targetDefaults = nxJson.targetDefaults ?? {};

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`process project: ${ projectName }`);
    project.targets ??= {};

    if (options.simplify) {
      for (const [ name, target ] of Object.entries(project.targets)) {
        if (targetDefaults[name]) {
          const defaults = targetDefaults[name];
          if (defaults.executor === target.executor) {
            delete target.executor;
          }
          if (defaults.inputs && target.inputs) {
            target.inputs = target.inputs.filter(input => !defaults.inputs!.includes(input));
          }
          if (defaults.outputs && target.outputs) {
            target.outputs = target.outputs.filter(input => !defaults.outputs!.includes(input));
          }
          if (defaults.dependsOn && target.dependsOn) {
            target.dependsOn = target.dependsOn.filter(input => !defaults.dependsOn!.includes(input));
          }
          if (defaults.defaultConfiguration === target.defaultConfiguration) {
            delete target.defaultConfiguration;
          }
          if (defaults.options && target.options) {
            for (const [ key, value ] of Object.entries(target.options)) {
              if (defaults.options[key] === value) {
                delete target.options[key];
              }
            }
          }
          if (defaults.configurations && target.configurations) {
            for (const [ configuration, properties ] of Object.entries(target.configurations)) {
              if (defaults.configurations[configuration]) {
                for (const [ key, value ] of Object.entries(properties)) {
                  if (defaults.configurations[configuration][key] === value) {
                    delete properties[key];
                  }
                }
              }
            }
          }
          if (defaults.command && target.command) {
            if (defaults.command === target.command) {
              delete target.command;
            }
          }
        }
      }
    }

    if (options.cleanup) {
      for (const target of Object.values(project.targets)) {
        if (target.configurations) {
          for (const key of Object.keys(target.configurations)) {
            if (Object.keys(target.configurations[key]).length === 0) {
              delete target.configurations[key];
            }
          }
          if (Object.keys(target.configurations).length === 0) {
            delete target.configurations;
          }
        }
        if (target.options) {
          if (Object.keys(target.options).length === 0) {
            delete target.options;
          }
        }
        if (target.inputs) {
          if (target.inputs.length === 0) {
            delete target.inputs;
          }
        }
        if (target.outputs) {
          if (target.outputs.length === 0) {
            delete target.outputs;
          }
        }
        if (target.dependsOn) {
          if (target.dependsOn.length === 0) {
            delete target.dependsOn;
          }
        }
      }
    }

    if (options.reorder) {
      project.targets = Object.entries(project.targets)
                              .sort(([ a ], [ b ]) => a.localeCompare(b))
                              .reduce((targets, [ key, value ]) => ({
                                ...targets,
                                [key]: value,
                              }), {});
    }

    if (Object.keys(project.targets).length === 0) {
      delete project.targets;
    }

    updateProjectConfiguration(tree, projectName, project);

  }
}

export default projectTargetGenerator;
