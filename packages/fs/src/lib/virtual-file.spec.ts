import { VirtualFile, VirtualFileLike } from './virtual-file';

describe('VirtualFile', () => {

  it('should be compatible with VirtualFileLike', () => {

    type List<VF extends VirtualFileLike> = Array<VF>;

    const file: VirtualFileLike = new VirtualFile('name', 'content/name', [] as any);

    const files: List<VirtualFile> = [
      new VirtualFile('name', 'content/name', [] as any)
    ];

  });

});
