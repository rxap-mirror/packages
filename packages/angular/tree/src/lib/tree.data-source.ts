import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Inject, Injectable, InjectionToken, isDevMode, OnInit, Optional } from '@angular/core';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
  RxapDataSource,
} from '@rxap/data-source';
import {
  EventOptions,
  ExpandNodeFunction,
  Node,
  NodeGetIconFunction,
  NodeGetStyleFunction,
  NodeGetTypeFunction,
  NodeHasDetailsFunction,
  NodeToDisplayFunction,
} from '@rxap/data-structure-tree';
import { Method } from '@rxap/pattern';
import { ToggleSubject } from '@rxap/rxjs';
import {
  coerceArray,
  getIdentifierPropertyValue,
  joinPath,
  Required,
  WithChildren,
  WithIdentifier,
} from '@rxap/utilities';
import { BehaviorSubject, combineLatest, from, merge, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { ISearchForm, SearchForm } from './search.form';

export function isSelectionChange<T>(obj: any): obj is SelectionChange<T> {
  return !!obj && obj['added'] !== undefined && obj['removed'] !== undefined;
}

export interface TreeDataSourceMetadata extends BaseDataSourceMetadata {
  selectMultiple?: boolean;
  expandMultiple?: boolean;
  scopeTypes?: string[];
  /**
   * If true the tree will be refreshed with caching disbabled after the first load
   */
  autoRefreshWithoutCache?: boolean;
}

export const RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD     = new InjectionToken(
  'rxap/tree/data-source/root-remote-method',
);
export const RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD = new InjectionToken(
  'rxap/tree/data-source/children-remote-method',
);

export const RXAP_TREE_DATA_SOURCE_APPLY_FILTER_METHOD = new InjectionToken(
  'rxap/tree/data-source/apply-filter-method');

export function flatTree<Data extends WithIdentifier & WithChildren = any>(
  tree: Node<Data> | Array<Node<Data>>,
  all = false,
): Array<Node<Data>> {
  tree = coerceArray(tree);

  function flat(acc: any[], list: any[]) {
    return [ ...acc, ...list ];
  }

  const _flatTree = (node: Node<Data>): Array<Node<Data>> => {
    if (!Array.isArray(node.children)) {
      if (isDevMode()) {
        console.log(node);
      }
      throw new Error('Node has not defined children');
    }

    if (all || node.expanded) {
      return [
        node,
        ...node.children.map((child) => _flatTree(child)).reduce(flat, []),
      ];
    } else {
      return [ node ];
    }
  };

  return tree
  .map((child) => _flatTree(child))
  .reduce((acc, items) => [ ...acc, ...items ], []);
}

export interface TreeApplyFilterParameter<Form extends ISearchForm = ISearchForm, Data extends WithIdentifier & WithChildren = any> {
  tree: Array<Node<Data>>,
  filter: Form;
  scopeTypes?: string[]
}

@Injectable()
export class DefaultTreeApplyFilterMethod<Data extends WithIdentifier & WithChildren = any>
  implements Method<Array<Node<Data>>, TreeApplyFilterParameter> {

  protected lastFilter: ISearchForm | null = null;

  call(
    {tree, filter, scopeTypes}: TreeApplyFilterParameter,
  ): Array<Node<Data>> | Promise<Array<Node<Data>>> {

    const nodes = flatTree(tree, true);

    if (this.isEqualToLastFilter(filter)) {
      return flatTree(tree, false).filter(node => node.isVisible);
    }

    const hasScopeFilter = (
      filter.scope &&
      Object.keys(filter.scope) &&
      Object.values(filter.scope).some((list) => list.length > 0)
    );

    // if not scope and the search filter is an empty string, collapse all non-root nodes
    if (!filter.search && filter.search !== this.lastFilter?.search) {
      nodes
      .filter(node => node.parent)
      .forEach(node => node.collapse({quite: true}));
    }

    if (filter.search || hasScopeFilter) {

      nodes.forEach(node => node.hide());

      for (const [ type, list ] of Object.entries(filter.scope ?? {})) {
        for (const node of nodes) {
          if (node.type === type) {
            if (list.some(item => getIdentifierPropertyValue(item) === node.id)) {
              node.show({forEachChildren: true});
            }
          }
        }
      }

      if (filter.search) {
        for (const node of nodes) {
          if (hasScopeFilter && node.hidden) {
            // if the filter has a scope filter. Only check the search filter on nodes that are shown by the scope
            // filter
            continue;
          }
          const display = node.display?.toLowerCase();
          if (display) {
            if (display.includes(filter.search.toLowerCase())) {
              node.show({parents: true});
            } else {
              node.hide();
            }
          } else {
            // if node has no display, it is not shown
            node.hide();
          }
        }
        // hide each node that has no visible children
        // there exists the edge case that a node has visible children, but the node.hide() function is called
        // after the child.show({ parent:true })
        for (const node of nodes.filter(n => n.hidden && n.hasChildren && n.children.some(child => child.isVisible))) {
          if (node.hidden) {
            console.warn('Edge case detected. Node has visible children but is hidden.');
            node.show();
          }
        }
        // expand each node that has visible children
        for (const node of nodes.filter(n => n.hasChildren)) {
          if (node.children.some(child => child.isVisible)) {
            // set quite to true to prevent the tree from reloading -> this would result in a infinite loop
            node.expand({quite: true});
          }
        }
      }

    } else {
      nodes.forEach(node => node.show());
    }

    this.lastFilter = filter;

    return flatTree(tree, false).filter(node => node.isVisible);

  }

  protected isEqualToLastFilter(filter: ISearchForm): boolean {
    if (this.lastFilter) {
      if (this.lastFilter.search === filter.search) {
        if (this.lastFilter.scope && filter.scope) {
          if (Object.keys(this.lastFilter.scope).every(key => Object.keys(filter.scope).includes(key))) {
            if (Object.entries(this.lastFilter.scope)
            .every(([ key, scope ]) => scope.some(item => filter.scope[key].includes(item)))) {
              return true;
            }
          }
        }
        if (filter.scope === this.lastFilter.scope) {
          return true;
        }
      }
    }
    return false;
  }

}

@RxapDataSource('tree')
@Injectable()
export class TreeDataSource<
  Data extends WithIdentifier & WithChildren = any,
  RootParameters = any,
  NodeParameters = any,
> extends BaseDataSource<Array<Node<Data>>, TreeDataSourceMetadata> implements OnInit {
  public tree$                                                   = new BehaviorSubject<Array<Node<Data>>>([]);
  @Required public treeControl!: FlatTreeControl<Node<Data>>;
  public selected!: SelectionModel<Node<Data>>;
  public expanded!: SelectionModel<string>;
  // TODO : änlich problem wie bei der redundaten expand SelectionModel.
  public override loading$                                       = new ToggleSubject(true);
  public searchForm: SearchForm | null                           = null;
  protected override _data$                                      = new BehaviorSubject<Array<Node<Data>>>([]);
  private _expandedLocalStorageSubscription: Subscription | null = null;
  private _selectedLocalStorageSubscription: Subscription | null = null;
  // im localStorage wird nur die id gespeichert.
  private _preSelected: string[]                                 = [];
  private _refreshMatchFilter                                    = new Subject<void>();
  private readonly applyFilterMethod: Method<Array<Node<Data>>, TreeApplyFilterParameter>;

  constructor(
    @Inject(RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD)
    public readonly rootRemoteMethod: Method<Data | Data[], RootParameters>,
    @Optional()
    @Inject(RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD)
    public readonly childrenRemoteMethod: Method<Data[], Node<Data>> | null         = null,
    @Optional()
    @Inject(RXAP_TREE_DATA_SOURCE_APPLY_FILTER_METHOD)
      applyFilterMethod: Method<Array<Node<Data>>, TreeApplyFilterParameter> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: TreeDataSourceMetadata | null                                       = null,
  ) {
    super(metadata);
    this.applyFilterMethod = applyFilterMethod ?? new DefaultTreeApplyFilterMethod();
    // TODO add new SelectModel class that saves the select model to the localStorage
    this.initSelected();
    this.initExpanded();
  }

  private _nodeParameters: NodeParameters | null = null;

  public get nodeParameters(): NodeParameters | null {
    return this._nodeParameters;
  }

  public set nodeParameters(nodeParameters: NodeParameters | null) {
    this._nodeParameters = nodeParameters;
    this.tree$.value.forEach(node => node.parameters = nodeParameters);
  }

  ngOnInit() {
    if (this.searchForm) {
      combineLatest([
        this.tree$,
        this.searchForm.rxapFormGroup.value$ as Observable<any>,
      ]).pipe(
        switchMap(async ([ tree, filter ]) => await this.applyFilterMethod.call({
          tree,
          filter,
          scopeTypes: this.metadata?.scopeTypes,
        })),
        map(nodes => coerceArray(nodes)),
      )
      .subscribe(data => this._data$.next(data));
    } else {
      this.tree$.pipe(
        map(tree => flatTree(tree).filter(node => node.isVisible)),
        tap(nodes => nodes.forEach(node => node.show())),
      ).subscribe(data => this._data$.next(data));
    }
  }

  public toDisplay: NodeToDisplayFunction<Data> = () =>
    'to display function not defined';

  public getIcon: NodeGetIconFunction<Data> = () => null;

  public getType: NodeGetTypeFunction<Data> = () => null;

  public getStyle: NodeGetStyleFunction<Data> = () => (
    {}
  );

  public hasDetails: NodeHasDetailsFunction<Data> = () => true;

  public matchFilter: (node: Node<Data>) => boolean = () => true;

  public async getTreeRoot(options: { cache?: boolean } = {}): Promise<Array<Node<Data>>> {
    this.loading$.enable();
    const root: Data | Data[] = await this.getRoot(options);

    let rootNodes: Array<Node<Data>>;

    if (Array.isArray(root)) {
      rootNodes = await Promise.all(root.map((node) => this._toNode(null, node)));
    } else {
      rootNodes = [ await this._toNode(null, root) ];
    }

    this.tree$.next(rootNodes);

    this.loading$.disable();

    return rootNodes;
  }

  public selectNode(node: Node<Data>): Promise<void> {
    if (!this.selected.isMultipleSelection()) {
      if (this.selected.hasValue()) {
        const currentSelectedNode = this.selected.selected[0];
        currentSelectedNode.deselect();
      }
    }
    this.selected.select(node);
    return Promise.resolve();
  }

  public setTreeControl(treeControl: FlatTreeControl<Node<Data>>): void {
    this.treeControl = treeControl;
  }

  public setMatchFilter(matchFilter: (node: Node<Data>) => boolean): void {
    this.matchFilter = matchFilter;
  }

  public setToDisplay(
    toDisplay: NodeToDisplayFunction<Data> = this.toDisplay,
  ): void {
    this.toDisplay = toDisplay;
  }

  public setGetIcon(getIcon: NodeGetIconFunction<Data> = this.getIcon): void {
    this.getIcon = getIcon;
  }

  public setHasDetails(
    hasDetails: NodeHasDetailsFunction<Data> = this.hasDetails,
  ): void {
    this.hasDetails = hasDetails;
  }

  public deselectNode(node: Node<Data>): Promise<void> {
    this.selected.deselect(node);
    return Promise.resolve();
  }

  // - the SelectModel that stores the selection into the local storage?
  public async _toNode(
    parent: Node<Data> | null,
    item: Data,
    depth                                = 0,
    onExpand: ExpandNodeFunction<Data>   = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<Data> = this.collapseNode.bind(this),
    onSelect: ExpandNodeFunction<Data>   = this.selectNode.bind(this),
    onDeselect: ExpandNodeFunction<Data> = this.deselectNode.bind(this),
  ): Promise<Node<Data>> {
    const node = await this.toNode(
      parent,
      item,
      depth,
      onExpand,
      onCollapse,
      onSelect,
      onDeselect,
    );

    if (this.expanded.isSelected(node.id)) {
      node
      .expand()
      .then(() => {
        // TODO : remove redundant this.expanded SelectionModel. Only store expanded nodes in
        // this.treeControl.expansionModel das problem ist das ich beim speicher in localStorage nur die id speicher.
        // Des wegen kann ich beim laden aus dem localStorage this.treeControl.expansionModel nicht einfach mit den
        // expanend nodes fullen. Da dort das node object benötigt wird möglich lösungen: - das node object läde die
        // entity mithilfe der id automatisch nach
        this.treeControl.expansionModel.select(node);
        // console.debug(`Restore expand for node '${node.id}' SUCCESSFULLY`);
      });
      // .catch(() =>
      //   console.debug(`Restore expand for node '${node.id}' FAILED`)
      // );
    }

    if (this._preSelected.includes(node.id)) {
      await node
      .select();
      // .then(() =>
      //   console.debug(`Restore select for node '${node.id}' SUCCESSFULLY`)
      // )
      // .catch(() =>
      //   console.debug(`Restore select for node '${node.id}' FAILED`)
      // );
    }

    return node;
  }

  public async expandNode(node: Node<Data>, options?: EventOptions): Promise<void> {

    if (!options?.onlySelf) {
      // required to sync the expanstion state with the tree control
      // if the collpase is trigged by node.expand this state is not
      // sync with the tree control
      this.treeControl.expansionModel.select(node);
    }

    if (node.item.hasChildren && !node.item.children?.length) {
      node.isLoading$.enable();

      const children = await this.getChildren(node);

      // add the loaded children to the item object
      node.item.children = children;

      node.addChildren(
        await Promise.all(children.map((child) =>
          this._toNode(node, child, node.depth + 1, node.onExpand, node.onCollapse),
        )),
      );

      node.isLoading$.disable();
    }

    this.expanded.select(node.id);

    if (!options?.quite) {
      this.tree$.next(this.tree$.value);
    }

  }

  public async getChildren(node: Node<Data>): Promise<Data[]> {
    if (!this.childrenRemoteMethod) {
      throw new Error(
        `The node '${ node.id }' has unloaded children but the RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD is not provided.`);
    }
    return this.childrenRemoteMethod.call(node);
  }

  public async getRoot(options: { cache?: boolean } = {}): Promise<Data | Data[]> {
    const rootParameters = await this.getRootParameters(options);
    return this.rootRemoteMethod.call(rootParameters);
  }

  public async getRootParameters(options: { cache?: boolean } = {}): Promise<RootParameters> {
    return options as any;
  }

  // TODO : find better solution to allow the overwrite of the toNode method
  // without losing the custom preselect and preexpand function

  public getNodeById(id: string): Node<Data> | null {
    function getNodeById(node: Node<Data>, nodeId: string) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.hasNode(nodeId)) {
        return node.getNode(nodeId);
      } else {
        return null;
      }
    }

    return (
      this.tree$.value
      .map((node) => getNodeById(node, id))
      .filter(Boolean)[0] || null
    );
  }

  public async toNode(
    parent: Node<Data> | null,
    item: Data,
    depth                                = 0,
    onExpand: ExpandNodeFunction<Data>   = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<Data> = this.collapseNode.bind(this),
    onSelect: ExpandNodeFunction<Data>   = this.selectNode.bind(this),
    onDeselect: ExpandNodeFunction<Data> = this.deselectNode.bind(this),
  ): Promise<Node<Data>> {
    return Node.ToNode(
      parent,
      item,
      depth,
      onExpand,
      onCollapse,
      this.toDisplay,
      this.getIcon,
      this.getType,
      onSelect,
      onDeselect,
      this.hasDetails,
      this.getStyle,
      this.nodeParameters,
    );
  }

  public collapseNode(node: Node<Data>, options?: EventOptions): Promise<void> {

    if (!options?.onlySelf) {
      // required to sync the expanstion state with the tree control
      // if the collpase is trigged by node.colapse this state is not
      // sync with the tree control
      this.treeControl.expansionModel.deselect(node);
    }

    this.expanded.deselect(node.id);

    if (!options?.quite) {
      this.tree$.next(this.tree$.value);
    }

    return Promise.resolve();
  }

  /**
   * Converts the tree structure into a list.
   *
   * @param tree
   * @param all true - include nodes children that are not expanded
   */
  public flatTree(tree: Node<Data>, all = false): Array<Node<Data>> {
    return flatTree(tree, all);
  }

  public override destroy(): void {
    super.destroy();
    // TODO : add subscription handler to BaseDataSource
    if (this._expandedLocalStorageSubscription) {
      this._expandedLocalStorageSubscription.unsubscribe();
    }
    if (this._selectedLocalStorageSubscription) {
      this._selectedLocalStorageSubscription.unsubscribe();
    }
  }

  public refreshMatchFilter(): void {
    this._refreshMatchFilter.next();
  }

  public override async refresh(): Promise<any> {
    const rootNodes = await this.getTreeRoot({cache: false});

    // refresh all expanded nodes;

    const loadExpandedNodes = async (children: ReadonlyArray<Node<Data>>) => {
      for (const child of children) {
        if (this.expanded.isSelected(child.id)) {
          // call the node method to ensure that the expanded property of
          // Node is set.
          await child.expand();
        }

        if (child.hasChildren) {
          await loadExpandedNodes(child.children);
        }
      }
    };

    await Promise.all(
      rootNodes
      .filter((node) => node.hasChildren)
      .map((node) => loadExpandedNodes(node.children)),
    );

    // const selected: Array<Node<Data>> = this.selected.selected
    // .map((node) => this.getNodeById(node.id))
    // .filter(Boolean) as any;
    // this.selected.clear();
    // this.selected.select(...selected);
  }

  public override reset(): any {
    this.selected.clear();
    this.expanded.clear();
    return this.getTreeRoot();
  }

  public setGetStyle(getStyle: NodeGetStyleFunction<any> = this.getStyle) {
    this.getStyle = getStyle;
  }

  public setGetType(getType: NodeGetTypeFunction<any> = this.getType) {
    this.getType = getType;
  }

  /**
   * recall the getStyle, getIcon and toDisplay methods
   * and update the node objects
   */
  public updateNodes() {
    this._data$.value.forEach(node => {
      node.style   = this.getStyle(node.item);
      node.icon    = coerceArray(this.getIcon(node.item));
      node.display = this.toDisplay(node.item);
    });
    this._data$.next(this._data$.value);
  }

  protected override _connect(
    collectionViewer: Required<BaseDataSourceViewer>,
  ): Observable<Array<Node<Data>>> {
    this.init();
    this.treeControl.expansionModel.changed.pipe(
      tap(async change => {
        if (isSelectionChange<Node<Data>>(change)) {
          const promiseList: Array<Promise<any>> = [];
          if (change.added) {
            promiseList.push(...change.added.map((node) => node.expand({onlySelf: true, quite: true})));
          }
          if (change.removed) {
            promiseList.push(...change.removed
            .slice()
            .reverse()
            .map((node) => node.collapse({onlySelf: true, quite: true})));
          }
          await Promise.all(promiseList);
          this.tree$.next(this.tree$.value);
        }
      }),
    ).subscribe();

    let loadRoot: Promise<Array<Node<Data>> | void> = Promise.resolve();

    if (this.tree$.value.length === 0) {
      loadRoot = this.getTreeRoot();
    }

    if (this.metadata.autoRefreshWithoutCache) {
      loadRoot = loadRoot.then(data => {
        this.refresh();
        return data;
      });
    }

    return from(loadRoot).pipe(
      tap((rootNodes) => {
        if (rootNodes) {
          const promises: Promise<any>[] = [];
          if (this.metadata.selectMultiple) {
            if (!this.selected.hasValue()) {
              promises.push(
                ...rootNodes
                .filter((node) => node.hasDetails)
                .map((node) => node.select()),
              );
            }
            if (!this.expanded.hasValue()) {
              promises.push(
                ...rootNodes
                .filter((node) => node.hasChildren)
                .map((node) => node.expand()),
              );
            }
          } else if (rootNodes.length) {
            const rootNode = rootNodes[0];
            if (!this.selected.hasValue()) {
              // TODO : rename hasDetails to isSelectable
              if (rootNode.hasDetails) {
                promises.push(rootNode.select());
              }
            }
            if (!this.expanded.hasValue()) {
              promises.push(rootNode.expand());
            }
          }
          return Promise.all(promises);
        }
        return Promise.resolve();
      }),
      switchMap(() =>
        merge(collectionViewer.viewChange, this._data$).pipe(
          map(() => this._data$.value),
        ),
      ),
      switchMap(nodeList => this._refreshMatchFilter.pipe(
        startWith(null),
        map(() => nodeList.filter(node => this.matchFilter(node))),
      )),
    );
  }

  private initSelected(): void {
    const key = joinPath('rxap/tree', this.id, 'selected');
    if (this.metadata['cacheSelected']) {
      if (localStorage.getItem(key)) {
        try {
          this._preSelected = JSON.parse(localStorage.getItem(key)!);
        } catch (e: any) {
          console.error('parse expanded tree data source nodes failed');
        }
      }
    }

    this.selected = new SelectionModel<Node<Data>>(
      !!this.metadata.selectMultiple,
      [],
    );
    if (this.metadata['cacheSelected']) {
      this._selectedLocalStorageSubscription = this.selected.changed
      .pipe(
        tap(() =>
          localStorage.setItem(
            key,
            JSON.stringify(this.selected.selected.map((s) => s.id)),
          ),
        ),
      )
      .subscribe();
    }
  }

  private initExpanded(): void {
    const key    = joinPath('rxap/tree', this.id, 'expanded');
    let expanded = [];
    if (this.metadata['cacheExpanded']) {
      if (localStorage.getItem(key)) {
        try {
          expanded = JSON.parse(localStorage.getItem(key)!);
        } catch (e: any) {
          console.error('parse expanded tree data source nodes failed');
        }
      }
    }

    this.expanded = new SelectionModel<string>(
      this.metadata.expandMultiple !== false,
      expanded,
    );
    if (this.metadata['cacheExpanded']) {
      this._expandedLocalStorageSubscription = this.expanded.changed
      .pipe(
        tap(() =>
          localStorage.setItem(
            key,
            JSON.stringify(this.expanded.selected),
          ),
        ),
      )
      .subscribe();
    }
  }

}
