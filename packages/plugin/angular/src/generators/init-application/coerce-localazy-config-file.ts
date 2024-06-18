import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceFile } from '@rxap/workspace-utilities';
import { join } from 'path';

export function coerceLocalazyConfigFile(tree: Tree, project: ProjectConfiguration) {
  const projectRoot = project.root;
  const localazyConfigPath = join(projectRoot, 'localazy.json');
  CoerceFile(tree, localazyConfigPath, JSON.stringify({
    upload: {
      type: 'xliff',
      deprecate: 'file',
      features: [
        'use_defined_lang_for_source',
        'dont_parse_target',
      ],
      files: 'src/i18n/messages.xlf',
    },
    download: {
      files: 'src/i18n/${languageCode}.xlf',
    },
  }, null, 2));
}
