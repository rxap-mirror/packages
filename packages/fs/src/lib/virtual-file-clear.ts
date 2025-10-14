import { VirtualFileLike } from './virtual-file';

export function virtualFileClear(file: VirtualFileLike) {
  if ('clear' in file && typeof file.clear === 'function') {
    file.clear();
  } else {
    console.warn(`The file type '${file.constructor?.name}' for file '${ file.fullName ?? file.name }' does not support the 'clear' method.`);
  }
}
