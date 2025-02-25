import { VirtualFile } from './virtual-file';
import { VirtualDirectory } from './virtual-directory';

describe('VirtualDirectory', () => {

  it('should add a file to the root directory', () => {

    const root = VirtualDirectory.CreateRoot();

    root.addFile(new VirtualFile('file.txt', 'file.txt', new ArrayBuffer(0)));

    expect(root.childrenNames).toEqual(['file.txt']);


  });

  it('should add a file to a sub directory', () => {

    const root = VirtualDirectory.CreateRoot();

    root.addFile(new VirtualFile('file.txt', 'sub/file.txt', new ArrayBuffer(0)));

    expect(root.childrenNames).toEqual(['sub']);

    const sub = root.directory('sub');
    expect(sub).toBeInstanceOf(VirtualDirectory);
    expect(sub.childrenNames).toEqual(['file.txt']);

  });

  it('should add a file to a sub/child directory', () => {

    const root = VirtualDirectory.CreateRoot();

    root.addFile(new VirtualFile('file.txt', 'sub/child/file.txt', new ArrayBuffer(0)));

    expect(root.childrenNames).toEqual(['sub']);

    const sub = root.directory('sub');
    expect(sub).toBeInstanceOf(VirtualDirectory);
    expect(sub.childrenNames).toEqual(['child']);

    const child = sub.directory('child');
    expect(child).toBeInstanceOf(VirtualDirectory);
    expect(child.childrenNames).toEqual(['file.txt']);

  });

  it('should add a file to an existing sub directory', () => {

    const root = VirtualDirectory.CreateRoot();

    root.addFile(new VirtualFile('file.txt', 'sub/child/file.txt', new ArrayBuffer(0)));
    root.addFile(new VirtualFile('file2.txt', 'sub/file2.txt', new ArrayBuffer(0)));

    expect(root.childrenNames).toEqual(['sub']);

    const sub = root.directory('sub');
    expect(sub).toBeInstanceOf(VirtualDirectory);
    expect(sub.childrenNames).toEqual(['child', 'file2.txt']);

    const child = sub.directory('child');
    expect(child).toBeInstanceOf(VirtualDirectory);
    expect(child.childrenNames).toEqual(['file.txt']);

  })

});
