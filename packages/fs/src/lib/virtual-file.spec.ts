import { AsyncVirtualFile, VirtualFile, VirtualFileLike } from './virtual-file';

describe('VirtualFile', () => {

  it('should be compatible with VirtualFileLike', () => {

    type List<VF extends VirtualFileLike> = Array<VF>;

    const file: VirtualFileLike = new VirtualFile('name', 'content/name', [] as any);

    const files: List<VirtualFile> = [
      new VirtualFile('name', 'content/name', [] as any)
    ];

  });

  it('clone with a new name should update the trailing name in fullName', () => {

    const file = new VirtualFile('old.txt', 'path/to/old.txt', new Uint8Array([ 1, 2, 3 ]).buffer);

    const cloned = file.clone('new.txt');

    expect(cloned.name).toBe('new.txt');
    expect(cloned.fullName).toBe('path/to/new.txt');

  });

  it('clone without a name change should keep the fullName', () => {

    const file = new VirtualFile('name.txt', 'path/to/name.txt', new Uint8Array([ 1 ]).buffer);

    const cloned = file.clone();

    expect(cloned.name).toBe('name.txt');
    expect(cloned.fullName).toBe('path/to/name.txt');

  });

});

describe('AsyncVirtualFile', () => {

  it('should retry the dataFactory after a failed read instead of caching the rejection', async () => {

    let attempt = 0;
    const file = new AsyncVirtualFile('a.txt', 'a.txt', () => {
      attempt++;
      return attempt === 1
        ? Promise.reject(new Error('transient'))
        : Promise.resolve(new Uint8Array([ 1, 2, 3 ]).buffer);
    });

    await expect(file.data).rejects.toThrow('transient');
    await expect(file.data).resolves.toEqual(new Uint8Array([ 1, 2, 3 ]).buffer);
    expect(attempt).toBe(2);

  });

});
