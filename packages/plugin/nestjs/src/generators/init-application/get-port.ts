import { Tree } from '@nx/devkit';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function getPort(tree: Tree, options: InitApplicationGeneratorSchema, projectSourceRoot: string) {
  if (options.port && options.projects?.length === 1) {
    return options.port;
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.config.ts'))!
      .toString()
      .match(/validationSchema\['PORT'\] = Joi.number\(\).default\((\d+)\);/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.module.ts'))!
      .toString()
      .match(/PORT: Joi.number\(\).default\((\d+)\)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return Math.floor(Math.random() * 1000) + 3000;
}
