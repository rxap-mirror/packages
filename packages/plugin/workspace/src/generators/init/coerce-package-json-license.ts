import { Tree } from '@nx/devkit';
import { UpdatePackageJson } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function coercePackageJsonLicense(tree: Tree, options: InitGeneratorSchema) {
  await UpdatePackageJson(tree, (json) => {
    json.license ??= options.license === 'mit' ? 'MIT' : 'GPL-3.0-or-later';
  });
}
