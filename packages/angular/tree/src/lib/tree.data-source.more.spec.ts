import { FlatTreeControl } from '@angular/cdk/tree';
import { TestBed } from '@angular/core/testing';
import { RXAP_DATA_SOURCE_METADATA } from '@rxap/data-source';
import { Node } from '@rxap/data-structure-tree';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ISearchForm } from './search.form';
import {
  DefaultTreeApplyFilterMethod,
  flatTree,
  isSelectionChange,
  RXAP_TREE_DATA_SOURCE_APPLY_FILTER_METHOD,
  RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD,
  RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD,
  TreeDataSource,
  TreeDataSourceMetadata,
} from './tree.data-source';

interface Item {
  id: string;
  name: string;
  type?: string;
  hasChildren?: boolean;
  children?: Item[];
}

const rootData = (): Item[] => [
  {
    id: 'a',
    name: 'Alpha',
    type: 'folder',
    hasChildren: true,
    children: [
      { id: 'a1', name: 'Apple', type: 'file', hasChildren: false, children: [] },
      { id: 'a2', name: 'Banana', type: 'file', hasChildren: false, children: [] },
    ],
  },
  { id: 'b', name: 'Beta', type: 'folder', hasChildren: true, children: [] },
  { id: 'c', name: 'Gamma', type: 'file', hasChildren: false, children: [] },
];

describe('flatTree and helpers', () => {
  let ds: TreeDataSource<Item>;
  let roots: Array<Node<Item>>;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        TreeDataSource,
        { provide: RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD, useValue: { call: async () => rootData() } },
        { provide: RXAP_DATA_SOURCE_METADATA, useValue: {} },
      ],
    });
    ds = TestBed.inject(TreeDataSource) as TreeDataSource<Item>;
    ds.setToDisplay((item: Item) => item.name);
    ds.setGetType((item: Item) => item.type ?? null);
    ds.setTreeControl(new FlatTreeControl<Node<Item>>((n) => n.depth, (n) => n.hasChildren));
    roots = await ds.getTreeRoot();
  });

  afterEach(() => jest.restoreAllMocks());

  it('isSelectionChange', () => {
    expect(isSelectionChange({ added: [], removed: [] })).toBe(true);
    expect(isSelectionChange({ added: [] })).toBe(false);
    expect(isSelectionChange(null)).toBe(false);
  });

  it('flatTree returns only expanded nodes unless all is set', () => {
    expect(flatTree(roots).map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(flatTree(roots, true).map((n) => n.id)).toEqual(['a', 'a1', 'a2', 'b', 'c']);
  });

  it('flatTree throws for nodes without children array', () => {
    expect(() => flatTree({ children: undefined } as any)).toThrow('Node has not defined children');
  });

  describe('DefaultTreeApplyFilterMethod', () => {
    const method = new DefaultTreeApplyFilterMethod<Item>();
    const filter = (f: Partial<ISearchForm>): ISearchForm => ({ search: '', scope: {}, ...f });

    it('shows everything without filter', async () => {
      const result = await method.call({ tree: roots, filter: filter({}) });
      expect(result.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    });

    it('filters by search term and shows parents', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const result = await method.call({ tree: roots, filter: filter({ search: 'ban' }) });
      expect(result.map((n) => n.id)).toEqual(['a', 'a1', 'a2'].filter((id) => id !== 'a1'));
    });

    it('hides everything when nothing matches', async () => {
      const result = await method.call({ tree: roots, filter: filter({ search: 'zzz' }) });
      expect(result).toEqual([]);
    });

    it('filters by scope', async () => {
      const result = await method.call({
        tree: roots,
        filter: filter({ scope: { file: [{ id: 'c' }] } }),
      });
      expect(result.map((n) => n.id)).toEqual(['c']);
    });

    it('combines scope and search', async () => {
      const result = await method.call({
        tree: roots,
        filter: filter({ search: 'gam', scope: { file: [{ id: 'c' }] } }),
      });
      expect(result.map((n) => n.id)).toEqual(['c']);
    });

    it('isEqualToLastFilter compares last filter', async () => {
      const m = new DefaultTreeApplyFilterMethod<Item>() as any;
      expect(m.isEqualToLastFilter(filter({}))).toBe(false);
      await m.call({ tree: roots, filter: filter({ search: 'x' }) });
      expect(m.isEqualToLastFilter(filter({ search: 'x' }))).toBe(true);
      expect(m.isEqualToLastFilter(filter({ search: 'y' }))).toBe(false);
      m.lastFilter = { search: 'x', scope: { t: [1] } };
      expect(m.isEqualToLastFilter({ search: 'x', scope: { t: [1] } })).toBe(true);
      expect(m.isEqualToLastFilter({ search: 'x', scope: { t: [2] } })).toBe(false);
      const same: any = { t: [1] };
      m.lastFilter = { search: 'x', scope: same };
      expect(m.isEqualToLastFilter({ search: 'x', scope: same })).toBe(true);
    });
  });
});

describe('TreeDataSource', () => {
  const children = jest.fn();
  const rootCall = jest.fn();
  let ds: TreeDataSource<Item>;

  function setup(metadata: TreeDataSourceMetadata & Record<string, any> = {}, extra: any[] = [], withChildren = true) {
    TestBed.configureTestingModule({
      providers: [
        TreeDataSource,
        { provide: RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD, useValue: { call: rootCall } },
        ...(withChildren ? [{ provide: RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD, useValue: { call: children } }] : []),
        { provide: RXAP_DATA_SOURCE_METADATA, useValue: { id: 'tree-test', ...metadata } },
        ...extra,
      ],
    });
    ds = TestBed.inject(TreeDataSource) as TreeDataSource<Item>;
    ds.setToDisplay((item: Item) => item.name);
    ds.setTreeControl(new FlatTreeControl<Node<Item>>((n) => n.depth, (n) => n.hasChildren));
    return ds;
  }

  beforeEach(() => {
    localStorage.clear();
    children.mockReset().mockResolvedValue([{ id: 'b1', name: 'Child', hasChildren: false, children: [] }]);
    rootCall.mockReset().mockResolvedValue(rootData());
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('loads a single root object', async () => {
    setup();
    rootCall.mockResolvedValue({ id: 'r', name: 'Root', hasChildren: false, children: [] });
    const nodes = await ds.getTreeRoot();
    expect(nodes.map((n) => n.id)).toEqual(['r']);
    expect(ds.tree$.value).toBe(nodes);
    expect(ds.getNodeById('r')).toBe(nodes[0]);
    expect(ds.getNodeById('missing')).toBeNull();
  });

  it('getRoot passes options as root parameters', async () => {
    setup();
    await ds.getRoot({ cache: false });
    expect(rootCall).toHaveBeenCalledWith({ cache: false });
  });

  it('finds nested nodes by id', async () => {
    setup();
    await ds.getTreeRoot();
    expect(ds.getNodeById('a1')?.id).toBe('a1');
  });

  it('expands a node and lazily loads children', async () => {
    setup();
    const [, b] = await ds.getTreeRoot();
    b.item.hasChildren = true;
    b.item.children = [];
    await ds.expandNode(b);
    expect(children).toHaveBeenCalledWith(b);
    expect(b.children.map((c) => c.id)).toEqual(['b1']);
    expect(ds.expanded.isSelected('b')).toBe(true);
    expect(ds.treeControl.expansionModel.isSelected(b)).toBe(true);
  });

  it('throws when children are needed but no method is provided', async () => {
    setup({}, [], false);
    const [, b] = await ds.getTreeRoot();
    await expect(ds.getChildren(b)).rejects.toThrow('RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD');
  });

  it('expandNode honours onlySelf and quite', async () => {
    setup();
    const [a] = await ds.getTreeRoot();
    const next = jest.spyOn(ds.tree$, 'next');
    await ds.expandNode(a, { onlySelf: true, quite: true });
    expect(ds.treeControl.expansionModel.isSelected(a)).toBe(false);
    expect(next).not.toHaveBeenCalled();
    await ds.collapseNode(a, { onlySelf: true, quite: true });
    expect(ds.expanded.isSelected('a')).toBe(false);
    await ds.collapseNode(a);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('expandNode expands the parent first', async () => {
    setup();
    const [a] = await ds.getTreeRoot();
    const a1 = a.children[0];
    expect(a.expanded).toBeFalsy();
    await ds.expandNode(a1, { quite: true });
    expect(ds.expanded.isSelected('a1')).toBe(true);
  });

  it('selects nodes (single) and deselects the previous one', async () => {
    setup();
    const [a, b] = await ds.getTreeRoot();
    await ds.selectNode(a);
    expect(ds.selected.selected).toEqual([a]);
    await ds.selectNode(b);
    expect(ds.selected.selected.map((n) => n.id)).toEqual(['b']);
    await ds.deselectNode(b);
    expect(ds.selected.hasValue()).toBe(false);
  });

  it('supports multiple selection', async () => {
    setup({ selectMultiple: true });
    const [a, b] = await ds.getTreeRoot();
    await ds.selectNode(a);
    await ds.selectNode(b);
    expect(ds.selected.selected.length).toBe(2);
  });

  it('restores expanded and selected state when the tree is reloaded', async () => {
    setup();
    const [a] = await ds.getTreeRoot();
    ds.expanded.select('a');
    ds.selected.select(a);
    const reloaded = await ds.getTreeRoot();
    expect(reloaded[0].expanded).toBe(true);
    expect(ds.selected.selected.map((n) => n.id)).toEqual(['a']);
  });

  it('caches selected and expanded ids in the local storage', async () => {
    setup({ cacheSelected: true, cacheExpanded: true });
    const [a] = await ds.getTreeRoot();
    ds.selected.select(a);
    ds.expanded.select('a');
    expect(JSON.parse(localStorage.getItem('rxap/tree/' + ds.id + '/selected')!)).toEqual(['a']);
    expect(JSON.parse(localStorage.getItem('rxap/tree/' + ds.id + '/expanded')!)).toEqual(['a']);
    ds.destroy();
  });

  it('reads cached state from the local storage and tolerates invalid json', () => {
    const probe = setup({ cacheSelected: true, cacheExpanded: true });
    const id = probe.id;
    TestBed.resetTestingModule();
    localStorage.setItem('rxap/tree/' + id + '/expanded', JSON.stringify(['x']));
    localStorage.setItem('rxap/tree/' + id + '/selected', JSON.stringify(['y']));
    setup({ cacheSelected: true, cacheExpanded: true });
    expect(ds.expanded.selected).toEqual(['x']);
    expect((ds as any)._preSelected).toEqual(['y']);
    TestBed.resetTestingModule();
    localStorage.setItem('rxap/tree/' + id + '/expanded', '{');
    localStorage.setItem('rxap/tree/' + id + '/selected', '{');
    setup({ cacheSelected: true, cacheExpanded: true });
    expect(console.error).toHaveBeenCalled();
  });

  it('updates node parameters on all nodes of the tree', async () => {
    setup();
    await ds.getTreeRoot();
    ds.nodeParameters = { x: 1 };
    expect(ds.nodeParameters).toEqual({ x: 1 });
    expect(ds.tree$.value.every((n) => (n as any).parameters?.x === 1)).toBe(true);
  });

  it('exposes setters for node callbacks and updateNodes applies them', async () => {
    setup();
    await ds.getTreeRoot();
    ds.setGetStyle(() => ({ color: 'red' }));
    ds.setGetIcon(() => ({ icon: 'x' }) as any);
    ds.setHasDetails(() => false);
    ds.setMatchFilter(() => true);
    ds.setGetStyle();
    ds.setGetIcon();
    ds.setGetType();
    ds.setHasDetails();
    ds.setToDisplay();
    ds.setToDisplay((i: Item) => i.name.toUpperCase());
    ds.setGetStyle(() => ({ color: 'red' }));
    (ds as any)._data$.next(ds.tree$.value);
    ds.updateNodes();
    expect(ds.tree$.value[0].display).toBe('ALPHA');
    expect(ds.tree$.value[0].style).toEqual({ color: 'red' });
  });

  it('flatTree delegates', async () => {
    setup();
    const roots = await ds.getTreeRoot();
    expect(ds.flatTree(roots[0], true).length).toBe(3);
  });

  it('refresh reloads without cache and reset clears state', async () => {
    setup();
    const [a] = await ds.getTreeRoot();
    ds.selected.select(a);
    await ds.refresh();
    expect(rootCall).toHaveBeenLastCalledWith({ cache: false });
    await ds.reset();
    expect(ds.selected.hasValue()).toBe(false);
    expect(ds.expanded.hasValue()).toBe(false);
  });

  describe('connect', () => {
    it('loads the root and emits visible nodes', async () => {
      setup();
      ds.ngOnInit();
      const nodes = await firstValueFrom(ds.connect({ id: 'v' }));
      expect(nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    });

    it('applies the match filter and refreshMatchFilter re-emits', async () => {
      setup();
      ds.ngOnInit();
      const seen: string[][] = [];
      const sub = ds.connect({ id: 'v' }).subscribe((n) => seen.push(n.map((x) => x.id)));
      await new Promise((r) => setTimeout(r));
      ds.setMatchFilter((n) => n.id !== 'a');
      ds.refreshMatchFilter();
      expect(seen[seen.length - 1]).toEqual(['b', 'c']);
      sub.unsubscribe();
    });

    it('auto refreshes once without cache when configured', async () => {
      setup({ autoRefreshWithoutCache: true });
      ds.ngOnInit();
      const sub = ds.connect({ id: 'v' }).subscribe();
      await new Promise((r) => setTimeout(r, 10));
      expect(rootCall).toHaveBeenCalledWith({ cache: false });
      sub.unsubscribe();
    });

    it('re-selects pre-selected ids after connecting', async () => {
      setup();
      (ds as any)._preSelected = ['c'];
      ds.ngOnInit();
      const sub = ds.connect({ id: 'v' }).subscribe();
      await new Promise((r) => setTimeout(r, 10));
      expect(ds.selected.selected.map((n) => n.id)).toEqual(['c']);
      sub.unsubscribe();
    });

    it('syncs the tree control expansion model with node expansion', async () => {
      setup();
      ds.ngOnInit();
      const sub = ds.connect({ id: 'v' }).subscribe();
      await new Promise((r) => setTimeout(r, 10));
      const a = ds.getNodeById('a')!;
      ds.treeControl.expansionModel.select(a);
      await new Promise((r) => setTimeout(r, 10));
      expect(ds.expanded.isSelected('a')).toBe(true);
      ds.treeControl.expansionModel.deselect(a);
      await new Promise((r) => setTimeout(r, 10));
      expect(ds.expanded.isSelected('a')).toBe(false);
      sub.unsubscribe();
    });
  });

  describe('with a search form', () => {
    it('uses the custom apply filter method', async () => {
      jest.useFakeTimers();
      const applyFilter = { call: jest.fn().mockImplementation(async ({ tree }) => tree.slice(0, 1)) };
      setup({ scopeTypes: ['file'] }, [{ provide: RXAP_TREE_DATA_SOURCE_APPLY_FILTER_METHOD, useValue: applyFilter }]);
      const value$ = new BehaviorSubject<ISearchForm>({ search: 'a', scope: {} });
      ds.searchForm = { rxapFormGroup: { value$ } } as any;
      ds.ngOnInit();
      await ds.getTreeRoot();
      await jest.advanceTimersByTimeAsync(1100);
      expect(applyFilter.call).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { search: 'a', scope: {} }, scopeTypes: ['file'] }),
      );
      expect((ds as any)._data$.value.length).toBe(1);
      jest.useRealTimers();
    });
  });
});
