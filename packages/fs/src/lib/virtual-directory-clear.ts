import { VirtualDirectoryLike } from './virtual-directory';
import { virtualFileClear } from './virtual-file-clear';

export function virtualDirectoryClear(directory: VirtualDirectoryLike) {
  if ('clear' in directory && typeof directory.clear === 'function') {
    directory.clear();
  } else {
    directory.forEachFile(file => virtualFileClear(file));
  }
}
