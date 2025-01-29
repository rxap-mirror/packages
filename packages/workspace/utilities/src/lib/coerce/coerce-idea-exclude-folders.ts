import { CoercePrefix } from '@rxap/utilities';
import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import {
  Builder,
  parseStringPromise,
} from 'xml2js';
import { SearchFile } from '../search-file';

export async function coerceIdeaExcludeFolders<Tree extends TreeLike>(tree: Tree, excludeFolders: string[]) {
  try {
    // uses jetbrains IDE
    for (const {
      path,
      content
    } of SearchFile(tree, '/.idea')) {
      if (path.endsWith('.iml')) {
        const doc = await parseStringPromise(content.toString());
        for (let excludeFolder of excludeFolders) {

          excludeFolder = CoercePrefix('file://$MODULE_DIR$/', excludeFolder.replace(/^\//, ''));

          if (Array.from(doc.module.component[0].content[0].excludeFolder).map((item: any) => item['$'].url).some(
            (url: string) => url === excludeFolder)) {
            continue;
          }
          doc.module.component[0].content[0].excludeFolder.push({ '$': { url: excludeFolder } });
        }
        const builder = new Builder();
        new TreeAdapter(tree).write(path, builder.buildObject(doc));
      }
    }
  } catch (e: any) {
    console.log('error updating exclude folders in .idea/*.iml', e.message);
  }
}
