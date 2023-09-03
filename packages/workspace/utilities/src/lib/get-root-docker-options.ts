import {
  TreeAdapter,
  TreeLike,
} from './tree';

export interface RootDockerOptions {
  imageName?: string;
  imageRegistry?: string;
}

export function GetRootDockerOptions(tree: TreeLike): RootDockerOptions {
  const adapter = new TreeAdapter(tree);
  const nxJson = JSON.parse(adapter.read('nx.json', 'utf-8')!);
  const packageJson = JSON.parse(adapter.read('package.json', 'utf-8')!);
  const options: RootDockerOptions = nxJson.targetDefaults?.['docker']?.options ?? {};
  options.imageName ??= packageJson.name;
  return options;
}
