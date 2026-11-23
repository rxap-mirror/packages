import { PaginatorFake } from '@rxap/data-source/testing';
import { Node } from '@rxap/data-structure-tree';
import {
  BehaviorSubject,
  Subject,
} from 'rxjs';
import { TreeTableDataSource } from './tree-table.data-source';

interface Item {
  id: string;
  name?: string;
  hasChildren?: boolean;
  children?: Item[];
}

const STORAGE_KEY = 'rxap/table-system/tree-table/tree-test/expanded';

describe('TreeTableDataSource', () => {
  let rootMethod: { call: ReturnType<typeof vi.fn>; metadata: { id: string } };
  let childrenMethod: { call: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    rootMethod = {
      call: vi.fn(async () => [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta', hasChildren: true }]),
      metadata: { id: 'tree-test' },
    };
    childrenMethod = {
      call: vi.fn(async ({ node }: { node: Node<Item> }) => [
        { id: `${ node.id }-1`, name: 'Child 1' },
        { id: `${ node.id }-2`, name: 'Child 2' },
      ]),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  function create(
    options: { paginator?: any; sort?: any; filter?: any; parameters?: any; metadata?: any } = {},
  ) {
    return new TreeTableDataSource<Item>(
      rootMethod as any,
      childrenMethod as any,
      options.paginator ?? null,
      options.sort ?? null,
      options.filter ?? null,
      options.parameters ?? null,
      'metadata' in options ? options.metadata : { id: 'tree-test' },
    );
  }

  async function flush(ms = 100) {
    await vi.advanceTimersByTimeAsync(ms);
  }

  describe('loading the tree', () => {
    it('loads an array of root nodes and publishes the flat rows with their node', async () => {
      const ds = create();
      const rows: any[] = [];
      ds._data$.subscribe((r) => rows.push(r));
      await ds.getTreeRoot();
      await flush();
      expect(rootMethod.call).toHaveBeenCalledWith({});
      expect(ds.tree$.value.map((n) => n.id)).toEqual(['a', 'b']);
      expect(rows).toHaveLength(1);
      expect(rows[0].map((r: any) => r.id)).toEqual(['a', 'b']);
      expect(rows[0][0].__node).toBe(ds.tree$.value[0]);
      expect(rows[0][0].name).toBe('Alpha');
      expect(ds.hasError$.value).toBe(false);
    });

    it('expands a single root node automatically', async () => {
      rootMethod.call.mockResolvedValue({
        id: 'root',
        hasChildren: true,
        children: [{ id: 'c1' }, { id: 'c2' }],
      });
      const ds = create();
      const rows: any[] = [];
      ds._data$.subscribe((r) => rows.push(r));
      await ds.getTreeRoot();
      await flush();
      expect(ds.expanded.isSelected('root')).toBe(true);
      expect(rows.at(-1).map((r: any) => r.id)).toEqual(['root', 'c1', 'c2']);
      expect(childrenMethod.call).not.toHaveBeenCalled();
    });

    it('reports a failing root method and enables the error state', async () => {
      rootMethod.call.mockRejectedValue(new Error('boom'));
      const ds = create();
      await expect(ds.getTreeRoot()).rejects.toThrow('Failed to load root nodes: boom');
      expect(ds.hasError$.value).toBe(true);
    });

    it('disables a previous error when the root is loaded again', async () => {
      const ds = create();
      ds.hasError$.enable();
      await ds.getTreeRoot();
      expect(ds.hasError$.value).toBe(false);
    });

    it('refresh and retry reload the root', async () => {
      const ds = create();
      await ds.refresh();
      await ds.retry();
      expect(rootMethod.call).toHaveBeenCalledTimes(2);
    });

    it('uses the metadata of the root method if none is injected', () => {
      const ds = create({ metadata: null });
      expect(ds.id).toBe('tree-test');
    });

    it('falls back to a default id without any metadata', () => {
      rootMethod.metadata = undefined as any;
      const ds = create({ metadata: null });
      expect(ds.id).toBe('tree-table-data-source');
    });

    it('creates plain nodes with toNode', async () => {
      const ds = create();
      const node = await ds.toNode({ id: 'x', children: [{ id: 'y' }] }, 2);
      expect(node.id).toBe('x');
      expect(node.depth).toBe(2);
      expect(node.children.map((c) => c.id)).toEqual(['y']);
    });

    it('delegates getRoot and getChildren to the methods', async () => {
      const ds = create();
      const event = { sort: { active: 'x', direction: 'asc' } } as any;
      await ds.getRoot(event);
      expect(rootMethod.call).toHaveBeenCalledWith(event);
      const node = await ds.toNode({ id: 'n' });
      await ds.getChildren(node, event);
      expect(childrenMethod.call).toHaveBeenCalledWith({ node, event });
    });
  });

  describe('expand and collapse', () => {
    it('lazily loads the children of a node on expand', async () => {
      const ds = create();
      const rows: any[] = [];
      ds._data$.subscribe((r) => rows.push(r));
      await ds.getTreeRoot();
      const b = ds.tree$.value[1];
      await b.expand();
      await flush();
      expect(childrenMethod.call).toHaveBeenCalledTimes(1);
      expect(childrenMethod.call.mock.calls[0][0].node).toBe(b);
      expect(childrenMethod.call.mock.calls[0][0].event).toEqual({});
      expect(b.children.map((c) => c.id)).toEqual(['b-1', 'b-2']);
      expect(b.children[0].depth).toBe(b.depth + 1);
      expect(ds.expanded.isSelected('b')).toBe(true);
      expect(rows.at(-1).map((r: any) => r.id)).toEqual(['a', 'b', 'b-1', 'b-2']);
    });

    it('does not reload children that are already present', async () => {
      const ds = create();
      await ds.getTreeRoot();
      const b = ds.tree$.value[1];
      await b.expand();
      await b.collapse();
      await b.expand();
      expect(childrenMethod.call).toHaveBeenCalledTimes(1);
    });

    it('collapses a node and removes its children from the flat rows', async () => {
      const ds = create();
      const rows: any[] = [];
      ds._data$.subscribe((r) => rows.push(r));
      await ds.getTreeRoot();
      const b = ds.tree$.value[1];
      await b.expand();
      await flush();
      expect(rows.at(-1)).toHaveLength(4);
      await b.collapse();
      await flush();
      expect(ds.expanded.isSelected('b')).toBe(false);
      expect(rows.at(-1).map((r: any) => r.id)).toEqual(['a', 'b']);
    });

    it('enables the error state if the children cannot be loaded', async () => {
      childrenMethod.call.mockRejectedValue(new Error('nope'));
      const ds = create();
      await ds.getTreeRoot();
      const b = ds.tree$.value[1];
      await expect(b.expand()).rejects.toThrow("Failed to load children nodes for 'b': nope");
      expect(ds.hasError$.value).toBe(true);
    });

    it('persists the expanded nodes in the local storage', async () => {
      const ds = create();
      await ds.getTreeRoot();
      await ds.tree$.value[1].expand();
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['b']);
      await ds.tree$.value[1].collapse();
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
    });

    it('restores expanded nodes from the local storage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['b']));
      const ds = create();
      const rows: any[] = [];
      ds._data$.subscribe((r) => rows.push(r));
      await ds.getTreeRoot();
      await flush();
      expect(childrenMethod.call).toHaveBeenCalledTimes(1);
      expect(ds.tree$.value[1].expanded).toBe(true);
      expect(rows.at(-1).map((r: any) => r.id)).toEqual(['a', 'b', 'b-1', 'b-2']);
    });

    it('restores expanded child nodes from the local storage', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['inner']));
      rootMethod.call.mockResolvedValue([
        { id: 'outer', hasChildren: true, children: [{ id: 'inner', hasChildren: true, children: [{ id: 'leaf' }] }] },
      ]);
      const ds = create();
      await ds.getTreeRoot();
      const outer = ds.tree$.value[0];
      const inner = outer.children[0];
      expect(inner.expanded).toBe(true);
      expect(outer.expanded).toBe(false);
    });

    it('keeps going if restoring an expanded node fails', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['b']));
      childrenMethod.call.mockRejectedValue(new Error('restore failed'));
      const ds = create();
      await ds.getTreeRoot();
      expect(ds.tree$.value.map((n) => n.id)).toEqual(['a', 'b']);
      expect(console.debug).toHaveBeenCalledWith("Restore expand for node 'b' FAILED");
    });

    it('keeps going if restoring an expanded child node fails', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['inner']));
      childrenMethod.call.mockRejectedValue(new Error('restore failed'));
      rootMethod.call.mockResolvedValue([
        { id: 'outer', hasChildren: true, children: [{ id: 'inner', hasChildren: true }] },
      ]);
      const ds = create();
      await ds.getTreeRoot();
      expect(ds.tree$.value.map((n) => n.id)).toEqual(['outer']);
      expect(console.debug).toHaveBeenCalledWith("Restore expand for child node 'inner' FAILED");
    });

    it('ignores an invalid local storage value', async () => {
      localStorage.setItem(STORAGE_KEY, '{not json');
      const ds = create();
      expect(ds.expanded.selected).toEqual([]);
      expect(console.debug).toHaveBeenCalledWith('parse expanded tree table data source nodes failed');
    });
  });

  describe('flatTree', () => {
    it('flattens only expanded nodes', async () => {
      const ds = create();
      const root = await ds.toNode({
        id: 'r',
        hasChildren: true,
        children: [{ id: 'c1', hasChildren: true, children: [{ id: 'g1' }] }, { id: 'c2' }],
      });
      expect(ds.flatTree(root).map((n) => n.id)).toEqual(['r']);
      await root.expand();
      expect(ds.flatTree(root).map((n) => n.id)).toEqual(['r', 'c1', 'c2']);
      await root.children[0].expand();
      expect(ds.flatTree(root).map((n) => n.id)).toEqual(['r', 'c1', 'g1', 'c2']);
    });

    it('throws for a node without a children array', () => {
      const ds = create();
      expect(() => ds.flatTree({ id: 'broken', children: null } as any)).toThrow('Node has not defined children');
    });
  });

  describe('init', () => {
    it('loads the root once and ignores repeated init calls', async () => {
      const ds = create();
      ds.init();
      ds.init();
      await flush();
      expect(rootMethod.call).toHaveBeenCalledTimes(1);
    });

    it('refreshes when the parameters change but skips the initial value', async () => {
      const parameters = new BehaviorSubject<any>({ p: 1 });
      const ds = create({ parameters });
      ds.init();
      await flush();
      expect(rootMethod.call).toHaveBeenCalledTimes(1);
      parameters.next({ p: 1 });
      await flush();
      expect(rootMethod.call).toHaveBeenCalledTimes(1);
      parameters.next({ p: 2 });
      await flush();
      expect(rootMethod.call).toHaveBeenCalledTimes(2);
    });

    it('stops reacting to parameters after it was destroyed', async () => {
      const parameters = new BehaviorSubject<any>({ p: 1 });
      const ds = create({ parameters });
      ds.init();
      await flush();
      ds.ngOnDestroy();
      parameters.next({ p: 2 });
      await flush();
      expect(rootMethod.call).toHaveBeenCalledTimes(1);
      const expandedChanged = vi.fn();
      ds.expanded.changed.subscribe(expandedChanged);
      ds.expanded.select('z');
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('filtering', () => {
    const tree = (): Item[] => [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta', hasChildren: true, children: [{ id: 'b1', name: 'Gamma' }] },
      { id: 'c', name: 'Delta' },
    ];

    async function rowsOf(ds: TreeTableDataSource<Item>) {
      const nodes = await Promise.all(tree().map((item) => ds.toNode(item)));
      return nodes.map((node) => ({ ...node.item, __node: node })) as any[];
    }

    it('matches filter queries by value or case insensitive substring', () => {
      const ds = create();
      const row: any = { id: 'a', name: 'Alpha', count: 3 };
      expect(ds.isMatchingFilter(row, [{ column: 'count', filter: 3 as any }])).toBe(true);
      expect(ds.isMatchingFilter(row, [{ column: 'name', filter: 'LPH' }])).toBe(true);
      expect(ds.isMatchingFilter(row, [{ column: 'name', filter: 'zzz' }])).toBe(false);
      expect(ds.isMatchingFilter(row, [{ column: 'count', filter: 4 as any }])).toBe(false);
      expect(ds.isMatchingFilter(row, [])).toBe(false);
    });

    it('finds matching nodes recursively', async () => {
      const ds = create();
      const rows = await rowsOf(ds);
      const nodes = rows.map((r) => r.__node);
      expect(ds.hasMatchingNodesByFilter(nodes, [])).toBe(true);
      expect(ds.hasMatchingNodesByFilter(nodes, [{ column: 'name', filter: 'gamma' }])).toBe(true);
      expect(ds.hasMatchingNodesByFilter(nodes, [{ column: 'name', filter: 'alpha' }])).toBe(true);
      expect(ds.hasMatchingNodesByFilter(nodes, [{ column: 'name', filter: 'nothing' }])).toBe(false);
      expect(ds.hasMatchingNodesByFilter([], [{ column: 'name', filter: 'a' }])).toBe(false);
    });

    it('returns a copy of the data for a string or empty filter', async () => {
      const ds = create();
      const rows = await rowsOf(ds);
      const byString = ds.applyFilterBy(rows, 'text');
      expect(byString).toEqual(rows);
      expect(byString).not.toBe(rows);
      expect(ds.applyFilterBy(rows, {})).toEqual(rows);
      expect(ds.applyFilterBy(rows, { name: '', other: undefined })).toEqual(rows);
    });

    it('keeps rows that match themselves or through a descendant and expands those', async () => {
      const ds = create();
      const rows = await rowsOf(ds);
      expect(ds.applyFilterBy(rows, { name: 'alpha' }).map((r) => r.id)).toEqual(['a']);
      const expand = vi.spyOn(rows[1].__node, 'expand');
      expect(ds.applyFilterBy(rows, { name: 'gamma' }).map((r) => r.id)).toEqual(['b']);
      expect(expand).toHaveBeenCalled();
      expect(ds.applyFilterBy(rows, { name: 'nothing' })).toEqual([]);
    });

    it('treats false and 0 as active filter values', async () => {
      const ds = create();
      const rows = [
        { id: 'x', flag: false, __node: await ds.toNode({ id: 'x' }) },
        { id: 'y', flag: true, __node: await ds.toNode({ id: 'y' }) },
      ] as any[];
      expect(ds.applyFilterBy(rows, { flag: false }).map((r) => r.id)).toEqual(['x']);
    });
  });

  describe('connect', () => {
    async function connect(ds: TreeTableDataSource<Item>) {
      const results: any[][] = [];
      const subscription = ds.connect({ id: 'viewer' }).subscribe((r) => results.push(r));
      await flush(100);
      await flush(500);
      return { results, subscription };
    }

    it('connects, initialises and publishes the rows', async () => {
      const ds = create();
      const { results } = await connect(ds);
      expect(rootMethod.call).toHaveBeenCalledTimes(1);
      expect(results.at(-1)!.map((r) => r.id)).toEqual(['a', 'b']);
      expect(ds.totalLength).toBe(2);
    });

    it('does not re-emit rows that did not change', async () => {
      const ds = create();
      const { results } = await connect(ds);
      const emitted = results.length;
      await ds.refresh();
      await flush(100);
      await flush(500);
      expect(results).toHaveLength(emitted);
    });

    it('emits again if the rows change in length, ids or content', async () => {
      const ds = create();
      const { results } = await connect(ds);
      const emitted = results.length;

      rootMethod.call.mockResolvedValue([{ id: 'a', name: 'Alpha' }]);
      await ds.refresh();
      await flush(100);
      await flush(500);
      expect(results).toHaveLength(emitted + 1);

      rootMethod.call.mockResolvedValue([{ id: 'z', name: 'Alpha' }]);
      await ds.refresh();
      await flush(100);
      await flush(500);
      expect(results).toHaveLength(emitted + 2);

      rootMethod.call.mockResolvedValue([{ id: 'z', name: 'Changed' }]);
      await ds.refresh();
      await flush(100);
      await flush(500);
      expect(results).toHaveLength(emitted + 3);
      expect(results.at(-1)![0].name).toBe('Changed');
    });

    it('applies filter, sort and pagination', async () => {
      rootMethod.call.mockResolvedValue([
        { id: '1', name: 'delta' },
        { id: '2', name: 'alpha' },
        { id: '3', name: 'charlie' },
        { id: '4', name: 'bravo' },
        { id: '5', name: 'echo' },
      ]);
      const paginator = new PaginatorFake(2, 0, 0);
      const sortChange = new Subject<any>();
      const filterChange = new Subject<any>();
      const sort = { active: 'name', direction: 'asc', start: 'asc', sortChange };
      const filter = { change: filterChange, current: {} };
      const ds = create({ paginator, sort, filter });
      const { results } = await connect(ds);
      expect(results.at(-1)!.map((r) => r.name)).toEqual(['alpha', 'bravo']);
      expect(paginator.length).toBe(5);

      paginator.next();
      await flush(500);
      expect(results.at(-1)!.map((r) => r.name)).toEqual(['charlie', 'delta']);

      sort.active = 'name';
      sortChange.next({ active: 'name', direction: 'desc' });
      await flush(500);
      expect(results.at(-1)!.map((r) => r.name)).toEqual(['charlie', 'bravo']);

      paginator.page.next({ pageIndex: 0, pageSize: 10 });
      filterChange.next({ name: 'a' });
      await flush(500);
      expect(results.at(-1)!.map((r) => r.name)).toEqual(['delta', 'charlie', 'bravo', 'alpha']);
    });
  });
});
