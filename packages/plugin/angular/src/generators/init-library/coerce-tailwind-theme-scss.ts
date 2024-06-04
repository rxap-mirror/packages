import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/workspace-utilities';
import { join } from 'path';
import { hasTailwindConfig } from './has-tailwind-config';

export function coerceTailwindThemeScss(tree: Tree, project: ProjectConfiguration) {

  if (!project.sourceRoot) {
    throw new Error(`The project ${ project.name } has no sourceRoot`);
  }

  const themeScssPath = join(project.sourceRoot, 'styles/theme.scss');
  if (hasTailwindConfig(tree, project)) {
    if (!tree.exists(themeScssPath)) {
      tree.write(themeScssPath, '@tailwind components;\n@tailwind utilities;');
    }
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'theme.css' ]);
  } else {
    if (tree.exists(themeScssPath)) {
      tree.delete(themeScssPath);
    }
  }
}
