import { VirtualFileLike } from './virtual-file';

export async function virtualFileToFile(virtualFile: VirtualFileLike) {
  return 'toFile' in virtualFile && typeof virtualFile.toFile === 'function'
    ? await virtualFile.toFile()
    : new File([await virtualFile.data], virtualFile.name, {
        type: virtualFile.mimetype,
      });
}
