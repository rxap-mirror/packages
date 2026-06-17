import { VirtualFile, VirtualFileLike } from './virtual-file';

export async function virtualFileClone(
  virtualFile: VirtualFileLike,
  name = virtualFile.name,
  fullName = virtualFile.fullName ?? virtualFile.name,
  deep = false
) {
  if ('clone' in virtualFile && typeof virtualFile.clone === 'function') {
    return virtualFile.clone(name, fullName, deep);
  } else {
    if (name !== virtualFile.name && !fullName.endsWith(name) && fullName.endsWith(virtualFile.name)) {
      fullName = fullName.slice(0, -virtualFile.name.length) + name;
    }
    const data = await virtualFile.data;
    return new VirtualFile(name, fullName, deep ? data.slice(0) : data);
  }
}
