import { GetNxJson } from './nx-json-file';
import { TreeLike } from './tree';

export function GetDefaultGeneratorOptions<T extends Record<string, unknown> = Record<string, unknown>>(tree: TreeLike, generatorName: string): T {
  const nxJson = GetNxJson(tree);
  return (nxJson.generators?.[generatorName] ?? {}) as T;
}
