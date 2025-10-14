import {
  VirtualDirectoryLike,
  virtualFileClear,
} from '@rxap/fs';

export function virtualDirectoryClear(directory: VirtualDirectoryLike) {
  if ('clear' in directory && typeof directory.clear === 'function') {
    directory.clear();
  } else {
    directory.forEachFile(file => virtualFileClear(file));
  }
}
