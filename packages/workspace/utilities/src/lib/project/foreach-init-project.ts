import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

export interface InitProjectOptions {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
}

export function* ForeachInitProject(
  tree: Tree,
  options: InitProjectOptions,
  skipProject: (tree: Tree, options: InitProjectOptions, project: ProjectConfiguration, projectName: string) => boolean
) {
  if (options.skipProjects) {
    return;
  }

  for (const [projectName, originalProject] of getProjects(tree).entries()) {
    if (skipProject(tree, options, originalProject, projectName)) {
      continue;
    }

    // Flag to track changes to the project
    let hasChanged = false;

    // Recursive function to wrap an object in a Proxy
    const createProxy = (obj: any) => {
      if (obj && typeof obj === 'object') {
        return new Proxy(obj, {
          set(target, property, value) {
            if (target[property] !== value) {
              hasChanged = true; // Mark as changed
            }
            target[property] = value;
            return true;
          },
          deleteProperty(target, property) {
            if (property in target) {
              hasChanged = true; // Mark as changed
            }
            return Reflect.deleteProperty(target, property);
          },
          get(target, property) {
            // If the property is an object, return a proxied version of it
            const value = target[property];
            if (value && typeof value === 'object') {
              return createProxy(value); // Recursively proxy objects
            }
            return value;
          },
        });
      }
      return obj;
    };

    // Create the proxied `project` object
    const project = createProxy(originalProject);

    // Yield the proxied project and project name
    yield [projectName, project];

    // Only update configuration if changes were detected
    if (hasChanged) {
      updateProjectConfiguration(tree, projectName, project);
    }
  }
}
