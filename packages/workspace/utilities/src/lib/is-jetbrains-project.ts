import { TreeLike } from '@rxap/workspace-utilities';

export function isJetbrainsProject<Tree extends TreeLike>(tree: Tree): boolean{
  return tree.exists('.idea/modules.xml');
}
