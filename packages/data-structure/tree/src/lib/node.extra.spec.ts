import { Node } from './node';

function build() {
  const onExpand = jest.fn().mockResolvedValue('expanded');
  const onCollapse = jest.fn().mockResolvedValue('collapsed');
  const onSelect = jest.fn().mockResolvedValue('selected');
  const onDeselect = jest.fn().mockResolvedValue('deselected');
  const root = Node.ToNode(
    null,
    {
      id: 'root',
      children: [
        { id: 'a', children: [{ id: 'a1' }, { id: 'a2' }] },
        { id: 'b' },
      ],
    } as any,
    0,
    onExpand,
    onCollapse,
    (item: any) => `display ${item.id}`,
    (item: any) => ({ name: item.id } as any),
    (item: any) => `type-${item.id}`,
    onSelect,
    onDeselect,
    (item: any) => item.id !== 'b',
    (item: any) => ({ color: item.id }),
    { p: 1 } as any,
  );
  return { root, onExpand, onCollapse, onSelect, onDeselect };
}

describe('Node (extended)', () => {
  it('ToNode applies the factory functions to every node', () => {
    const { root } = build();
    expect(root.display).toBe('display root');
    expect(root.icon).toEqual([{ name: 'root' }]);
    expect(root.type).toBe('type-root');
    expect(root.style).toEqual({ color: 'root' });
    expect(root.id).toBe('root');
    const b = root.getNode('b')!;
    expect(b.hasDetails).toBe(false);
    expect(b.parent).toBe(root);
    expect(root.getNode('a1')!.depth).toBe(2);
    expect(root.parameters).toEqual({ p: 1 });
  });

  it('ToNode uses sensible defaults', () => {
    const node = Node.ToNode(null, { id: 'x' } as any, 0, jest.fn(), jest.fn());
    expect(node.display).toBe('to display function not defined');
    expect(node.icon).toEqual([]);
    expect(node.type).toBeNull();
    expect(node.hasDetails).toBe(true);
    expect(node.style).toEqual({});
    expect(node.parameters).toBeNull();
    expect(node.onSelect).toBeNull();
  });

  it('throws if the item has no identifier', () => {
    expect(() => new Node(null, {} as any, [], 0, jest.fn(), jest.fn())).toThrow('Node item has not an identifier property');
  });

  it('hasChildren reflects the item flag when there are no child nodes', () => {
    const node = Node.ToNode(null, { id: 'x', hasChildren: true } as any, 0, jest.fn(), jest.fn());
    expect(node.hasChildren).toBe(true);
    expect(node.children).toHaveLength(0);
    node.clearChildren();
    expect(node.hasChildren).toBe(true);

    const leaf = Node.ToNode(null, { id: 'y' } as any, 0, jest.fn(), jest.fn());
    expect(leaf.hasChildren).toBe(false);
  });

  it('parameters setter propagates to all descendants', () => {
    const { root } = build();
    root.parameters = { p: 2 } as any;
    expect(root.getNode('a2')!.parameters).toEqual({ p: 2 });
  });

  it('setDepth updates the whole subtree', () => {
    const { root } = build();
    root.getNode('a')!.setDepth(5);
    expect(root.getNode('a')!.depth).toBe(5);
    expect(root.getNode('a2')!.depth).toBe(6);
  });

  it('addChildren appends or prepends, deduplicates by id and inherits callbacks', () => {
    const { root, onExpand } = build();
    const mk = (id: string) => Node.ToNode(null, { id } as any, 0, jest.fn(), jest.fn());
    root.addChildren([mk('c'), mk('d')]);
    expect(root.children.map(c => c.id)).toEqual(['a', 'b', 'c', 'd']);
    root.addChildren([mk('e'), mk('a')], true);
    expect(root.children.map(c => c.id)).toEqual(['e', 'a', 'b', 'c', 'd']);
    expect(root.getNode('e')!.onExpand).toBe(onExpand);
    expect(root.getNode('e')!.depth).toBe(1);
  });

  it('children are frozen', () => {
    const { root } = build();
    expect(Object.isFrozen(root.children)).toBe(true);
  });

  it('clearChildren removes all children', () => {
    const { root } = build();
    root.clearChildren();
    expect(root.children).toHaveLength(0);
    expect(root.hasNode('a')).toBe(false);
  });

  it('isNode / hasNode / getNode', () => {
    const { root } = build();
    expect(root.isNode('root')).toBe(true);
    expect(root.isNode('a')).toBe(false);
    expect(root.hasNode('a2')).toBe(true);
    expect(root.hasNode('zzz')).toBe(false);
    expect(root.getNode('root')).toBe(root);
    expect(root.getNode('a2')!.id).toBe('a2');
    expect(root.getNode('zzz')).toBeNull();
  });

  describe('expand / collapse / select', () => {
    it('toggleExpand switches between expand and collapse', async () => {
      const { root, onExpand, onCollapse } = build();
      expect(root.expanded).toBe(false);
      await expect(root.toggleExpand({ quite: true })).resolves.toBe('expanded');
      expect(root.expanded).toBe(true);
      expect(onExpand).toHaveBeenCalledWith(root, { quite: true });
      await expect(root.toggleExpand()).resolves.toBe('collapsed');
      expect(root.expanded).toBe(false);
      expect(onCollapse).toHaveBeenCalledWith(root, {});
    });

    it('toggleSelect switches between select and deselect', async () => {
      const { root, onSelect, onDeselect } = build();
      await expect(root.toggleSelect()).resolves.toBe('selected');
      expect(root.selected).toBe(true);
      expect(onSelect).toHaveBeenCalledWith(root, {});
      await expect(root.toggleSelect()).resolves.toBe('deselected');
      expect(root.selected).toBe(false);
      expect(onDeselect).toHaveBeenCalled();
    });

    it('select / deselect resolve without handlers', async () => {
      const node = Node.ToNode(null, { id: 'x' } as any, 0, jest.fn(), jest.fn());
      await expect(node.select()).resolves.toBeUndefined();
      expect(node.selected).toBe(true);
      await expect(node.deselect()).resolves.toBeUndefined();
      expect(node.selected).toBe(false);
    });
  });

  describe('hide / show', () => {
    it('onlySelf ignores relation options', () => {
      const { root } = build();
      const a = root.getNode('a')!;
      a.hide({ onlySelf: true, forEachChildren: true, parents: true });
      expect(a.hidden).toBe(true);
      expect(root.hidden).toBe(false);
      expect(root.getNode('a1')!.hidden).toBe(false);
      a.show({ onlySelf: true, forEachChildren: true });
      expect(a.hidden).toBe(false);
    });

    it('parent / parents affect ancestors', () => {
      const { root } = build();
      const a1 = root.getNode('a1')!;
      a1.hide({ parent: true });
      expect(root.getNode('a')!.hidden).toBe(true);
      expect(root.hidden).toBe(false);
      a1.hide({ parents: true });
      expect(root.hidden).toBe(true);
      a1.show({ parents: true });
      expect(root.hidden).toBe(false);
      expect(root.getNode('a')!.hidden).toBe(false);
      root.getNode('a')!.hide({ onlySelf: true });
      a1.show({ parent: true });
      expect(root.getNode('a')!.hidden).toBe(false);
    });

    it('root nodes tolerate parent options', () => {
      const { root } = build();
      expect(() => root.hide({ parent: true, parents: true })).not.toThrow();
      expect(() => root.show({ parent: true })).not.toThrow();
    });

    it('isHidden accounts for children visibility', () => {
      const { root } = build();
      const a = root.getNode('a')!;
      a.getNode('a1')!.hide({ onlySelf: true });
      expect(a.isHidden).toBe(false);
      a.getNode('a2')!.hide({ onlySelf: true });
      expect(a.hasVisibleChildren).toBe(false);
      expect(a.isHidden).toBe(true);
      expect(root.isVisible).toBe(true);
    });
  });

  it('isLoading$ toggles', () => {
    const { root } = build();
    const values: boolean[] = [];
    root.isLoading$.subscribe(v => values.push(v));
    root.isLoading$.enable();
    root.isLoading$.disable();
    expect(values[values.length - 1]).toBe(false);
    expect(values).toContain(true);
  });
});
