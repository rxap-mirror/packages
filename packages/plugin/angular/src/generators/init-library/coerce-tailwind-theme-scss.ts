import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  CoerceIgnorePattern,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { hasTailwindConfig } from './has-tailwind-config';

export function coerceTailwindThemeScss(tree: Tree, project: ProjectConfiguration) {
  const themeScssPath = join(GetProjectSourceRoot(project), 'styles/theme.scss');
  if (hasTailwindConfig(tree, project)) {
    CoerceFile(tree, themeScssPath, '@tailwind components;\n@tailwind utilities;');
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'theme.css' ]);
  } else {
    if (tree.exists(themeScssPath)) {
      tree.delete(themeScssPath);
    }
  }
}
