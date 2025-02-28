import { Tree } from '@nx/devkit';
import { UpdatePackageJson } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function coerceRootPackageJsonScripts(tree: Tree, options: InitGeneratorSchema) {
  UpdatePackageJson(tree, (json) => {
    json.scripts ??= {};
    if (options.withHusky) {
      json.scripts['prepare'] ??= 'husky install';
    } else if (json.scripts['prepare'] === 'husky install') {
      delete json.scripts['prepare'];
    }
    json.scripts['schematic'] ??= 'bash tools/scripts/schematic.sh';
    if (options.fullStack) {
      json.scripts['server'] ??= 'bash tools/scripts/start-local-dev-services.sh';
      json.scripts['server:status'] ??= 'bash tools/scripts/get-local-dev-services-status.sh';
      json.scripts['server:stop'] ??= 'bash tools/scripts/stop-local-dev-services.sh';
      json.scripts['init:env'] ??= 'bash tools/scripts/setup-env-file.sh';
    }
  });
}
