import {
  ExpandedPluginConfiguration,
  NxJsonConfiguration,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  DeleteEmptyProperties,
} from '@rxap/utilities';
import { NxJson } from '../nx-json';

export function CoerceNxPlugin(nxJson: NxJsonConfiguration | NxJson, entryPoint: string, options?: Record<string, any>, include?: string[], exclude?: string[]) {
  nxJson.plugins ??= [];
  const item = ((!options || !Object.keys(options).length) && !include?.length && !exclude?.length) ? entryPoint : DeleteEmptyProperties<ExpandedPluginConfiguration>({ plugin: entryPoint, options, include, exclude });
  CoerceArrayItems(nxJson.plugins, [item], (a, b) => {
    if (typeof a === 'string') {
      return typeof b === 'string' ? a === b : b.plugin === a;
    } else {
      return typeof b === 'string' ? a.plugin === b : a.plugin === b.plugin;
    }
  });
}
