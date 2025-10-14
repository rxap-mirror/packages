import { VirtualDirectoryLike } from '@rxap/fs';

export function virtualDirectoryRegisterFiles(directory: VirtualDirectoryLike) {
  if ('registerFiles' in directory && typeof directory.registerFiles === 'function') {
    return directory.registerFiles();
  } else {
    console.warn(`The directory type '${directory.constructor?.name}' for directory '${ directory.name }' does not support the 'registerFiles' method.`);
  }
}
