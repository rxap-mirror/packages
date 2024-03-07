import { SelectionModel } from '@angular/cdk/collections';
import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
  OnDestroy,
  Optional,
} from '@angular/core';
import {
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  AbstractTableDataSource,
  FilterLike,
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS,
  RXAP_TABLE_DATA_SOURCE_SORT,
  SortLike,
  TableDataSourceMetadata,
  TableEvent,
} from '@rxap/data-source/table';
import {
  ExpandNodeFunction,
  Node,
} from '@rxap/data-structure-tree';
import { Method } from '@rxap/pattern';
import '@rxap/rxjs';
import {
  equals,
  joinPath,
  WithChildren,
  WithIdentifier,
} from '@rxap/utilities';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  share,
  Subject,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  skip,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { RowDataWithNode } from './row-data-with-node';

export const RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD =
  new InjectionToken('rxap/tree/data-source/root-method');
export const RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD =
  new InjectionToken('rxap/tree/data-source/children-method');

export type TreeTableEvent = Omit<TableEvent, 'start' | 'end'>;

export interface FilterQuery {
  column: string;
  filter: string;
}

@Injectable()
export class TreeTableDataSource<RowData extends WithIdentifier & WithChildren,
  Parameters = any>
  extends AbstractTableDataSource<RowDataWithNode<RowData>, Parameters>
  implements OnDestroy {
  public tree$ = new BehaviorSubject<Array<Node<RowData>>>([]);

  public expanded!: SelectionModel<string>;
  public override _data$                                         = new Subject<Array<RowDataWithNode<RowData>>>();
  private _expandedLocalStorageSubscription: Subscription | null = null;
  private _subscription?: Subscription;

  constructor(
    @Inject(RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD)
    public readonly rootMethod: Method<RowData | RowData[], TreeTableEvent>,
    @Inject(RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD)
    public readonly childrenMethod: Method<RowData[], { node: Node<RowData>, event: TreeTableEvent }>,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null           = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_SORT)
      sort: SortLike | null                     = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_FILTER)
      filter: FilterLike | null                 = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PARAMETERS)
      parameters: Observable<Parameters> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: TableDataSourceMetadata | null  = rootMethod.metadata,
  ) {
    super(
      paginator,
      sort,
      filter,
      parameters,
      metadata ?? rootMethod.metadata ?? {id: 'tree-table-data-source'},
    );
    this.tree$
      .pipe(
        debounceTime(100),
        map((tree) =>
          tree
            .map((child) => this.flatTree(child))
            .reduce((acc, nodes) => [ ...acc, ...nodes ], []),
        ),
        map((flatTree) =>
          flatTree.map((node) => ({
            ...node.item,
            __node: node,
          })),
        ),
      )
      .subscribe(this._data$);
    this.initExpanded();
  }

  public override init() {
    if (this._initialised) {
      return;
    }
    super.init();
    this.getTreeRoot();
    // TODO : workaround the handle parameters change
    if (this.parameters) {
      this._subscription = this.parameters
        .pipe(
          distinctUntilChanged((a, b) => equals(a, b)),
          skip(1),
          tap(() => this.refresh()),
        )
        .subscribe();
    }
  }

  public async getTreeRoot(event: TreeTableEvent = {}): Promise<void> {
    this.loading$.next(true);
    this.hasError$.disable();

    const root: RowData | RowData[] = await this.getRoot(event).catch((error) => {
      this.hasError$.enable();
      throw new Error(`Failed to load root nodes: ${ error.message }`);
    });

    let rootNode: Array<Node<RowData>> = [];

    if (Array.isArray(root)) {
      for (const node of root) {
        rootNode.push(await this._toNode(node));
      }
    } else {
      rootNode = [ await this._toNode(root) ];
      if (!rootNode[0].expanded) {
        await rootNode[0].expand();
      }
    }

    this.loading$.next(false);

    this.tree$.next(rootNode);
  }

  public async getChildren(node: Node<RowData>, event: TreeTableEvent): Promise<RowData[]> {
    return this.childrenMethod.call({node, event});
  }

  public async getRoot(event: TreeTableEvent): Promise<RowData | RowData[]> {
    return this.rootMethod.call(event);
  }

  public collapseNode(node: Node<RowData>): Promise<void> {
    this.expanded.deselect(node.id);
    this.tree$.next(this.tree$.value);
    return Promise.resolve();
  }

  public async _toNode(
    row: RowData,
    depth                                   = 0,
    onExpand: ExpandNodeFunction<RowData>   = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<RowData> = this.collapseNode.bind(this),
  ): Promise<Node<RowData>> {
    const node = await this.toNode(row, depth, onExpand, onCollapse);

    if (this.expanded.isSelected(node.id) && !node.expanded) {
      await node
        .expand()
        .then(() =>
          console.debug(`Restore expand for node '${ node.id }' SUCCESSFULLY`),
        )
        .catch(() =>
          console.debug(`Restore expand for node '${ node.id }' FAILED`),
        );
    }

    for (const child of node.children) {
      if (this.expanded.isSelected(child.id) && !child.expanded) {
        await child
          .expand()
          .then(() =>
            console.debug(
              `Restore expand for child node '${ child.id }' SUCCESSFULLY`,
            ),
          )
          .catch(() =>
            console.debug(`Restore expand for child node '${ child.id }' FAILED`),
          );
      }
    }

    return node;
  }

  public async expandNode(node: Node<RowData>): Promise<void> {
    if (node.item.hasChildren && !node.item.children?.length) {
      // TODO : get treeTableEvent from paginator, sort and filter
      const children: RowData[] = await this.getChildren(node, {}).catch((error) => {
        this.hasError$.enable();
        throw new Error(`Failed to load children nodes for '${ node.id }': ${ error.message }`);
      });

      node.item.children = children;

      const addChildren: Array<Node<RowData>> = [];

      for (const child of children) {
        const addChild = await this._toNode(
          child,
          node.depth +
          1,
          node.onExpand,
          node.onCollapse,
        );
        addChildren.push(addChild);
      }

      node.addChildren(addChildren);
    }

    this.expanded.select(node.id);

    this.tree$.next(this.tree$.value);
  }

  public toNode(
    row: RowData,
    depth                                   = 0,
    onExpand: ExpandNodeFunction<RowData>   = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<RowData> = this.collapseNode.bind(this),
  ): Node<RowData> | Promise<Node<RowData>> {
    return Node.ToNode(null, row, depth, onExpand, onCollapse);
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._expandedLocalStorageSubscription?.unsubscribe();
    this._subscription?.unsubscribe();
  }

  public flatTree(tree: Node<RowData>): Array<Node<RowData>> {
    function flat(acc: any[], list: any[]) {
      return [ ...acc, ...list ];
    }

    function flatTree(node: Node<RowData>): Array<Node<RowData>> {
      if (!Array.isArray(node.children)) {
        if (isDevMode()) {
          console.log(node);
        }
        throw new Error('Node has not defined children');
      }

      if (node.expanded) {
        return [
          node,
          ...node.children.map((child) => flatTree(child)).reduce(flat, []),
        ];
      } else {
        return [ node ];
      }
    }

    return flatTree(tree);
  }

  public override retry() {
    return this.getTreeRoot();
  }

  public override refresh(): any {
    return this.getTreeRoot();
  }

  isMatchingFilter(item: RowDataWithNode<RowData>, filterList: Array<FilterQuery>): boolean {
    for (const filter of filterList) {
      const value = (item as any)[filter.column] as any;
      if (value === filter.filter) {
        return true;
      }
      if (typeof value === 'string' && typeof filter.filter === 'string') {
        return value.toLowerCase().includes(filter.filter.toLowerCase());
      }
    }
    return false;
  }

  hasMatchingNodesByFilter(
    nodeList: ReadonlyArray<Node<any>>,
    filterList: Array<FilterQuery>,
  ): boolean {

    if (!filterList.length) {
      return true;
    }

    return nodeList.some((node) => {

      if (this.isMatchingFilter(node.item, filterList)) {
        return true;
      }

      if (!node.hasChildren) {
        // If item has no children and doesn't pass the filter, remove it
        return false;
      }

      return this.hasMatchingNodesByFilter(node.children ?? [], filterList);
    });
  }

  override applyFilterBy(
    data: ReadonlyArray<RowDataWithNode<RowData>>,
    filter: Record<string, any> | string,
  ): RowDataWithNode<RowData>[] {
    const filterList = typeof filter === 'string' ?
      [] :
                       Object.entries(filter).map(([ column, filter ]) => ({column, filter}));
    if (!filterList.length ||
        filterList.every((filter) => !filter.filter && filter.filter !== false && filter.filter !== 0)) {
      return data.slice();
    }

    return data.filter(item => {

      if (this.isMatchingFilter(item, filterList)) {
        return true;
      }

      const hasMatch = this.hasMatchingNodesByFilter(item.__node.children, filterList);

      if (hasMatch) {
        item.__node.expand();
      }

      return hasMatch;

    });

  }

  protected override _connect(
    viewer: BaseDataSourceViewer,
  ): Observable<Array<RowDataWithNode<RowData>>> {
    this.init();
    console.log('connect tree table data source');
    return this._data$.pipe(
      tap((data) => this.updateTotalLength(data.length)),
      distinctUntilChanged((a, b) => {
        if (a.length !== b.length) {
          return false;
        }
        return equals(a.map(item => item.__node.id), b.map(item => item.__node.id));
      }),
      switchMap((data) => {
        return combineLatest([
          this.paginator?.page?.pipe(
            startWith({
              pageIndex: this.paginator.pageIndex,
              pageSize: this.paginator.pageSize,
              length: this.paginator.length,
            }),
          ) ?? of(null),
          this.sort?.sortChange?.pipe(
            startWith({
              active: this.sort?.active,
              direction: this.sort?.direction,
            }),
          ) ?? of(null),
          this.filter?.change.pipe(startWith({})) ?? of(null),
        ]).pipe(
          map(([ page, sort, filter ]) => ({
            page,
            sort,
            filter,
          })),
          debounceTime(500),
          distinctUntilChanged((a, b) => equals(a, b)),
          map((event) => {
            const {page, sort, filter} = event;
            let filteredData           = data;

            if (filter) {
              filteredData = this.applyFilterBy(filteredData, filter);
            }

            let sortData = filteredData;

            if (sort) {
              sortData = this.applySortBy(
                sortData,
                sort.active,
                sort.direction,
              );
            }

            if (page) {
              return this.applyPagination(
                sortData,
                page.pageSize,
                page.pageIndex,
              );
            }

            return sortData;
          }),
        );
      }),
      share(),
    );
  }

  private initExpanded(): void {
    const key    = joinPath('rxap/table-system/tree-table', this.id, 'expanded');
    let expanded = [];
    if (localStorage.getItem(key)) {
      try {
        expanded = JSON.parse(localStorage.getItem(key)!);
      } catch (e: any) {
        console.debug('parse expanded tree table data source nodes failed');
      }
    }

    this.expanded                          = new SelectionModel<string>(true, expanded);
    this._expandedLocalStorageSubscription = this.expanded.changed
      .pipe(
        tap(() =>
          localStorage.setItem(key, JSON.stringify(this.expanded.selected)),
        ),
      )
      .subscribe();
  }
}
