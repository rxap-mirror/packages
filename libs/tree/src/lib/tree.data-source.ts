import {
  BehaviorSubject,
  from,
  merge,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  SelectionChange,
  SelectionModel
} from '@angular/cdk/collections';
import {
  map,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA
} from '@rxap/data-source';
import {
  joinPath,
  Required,
  WithChildren,
  WithIdentifier
} from '@rxap/utilities';
import {
  Inject,
  Injectable,
  InjectionToken
} from '@angular/core';
import {
  ExpandNodeFunction,
  Node,
  NodeGetIconFunction,
  NodeHasDetailsFunction,
  NodeToDisplayFunction,
  Method,
  ToggleSubject
} from '@rxap/utilities/rxjs';

export function isSelectionChange<T>(obj: any): obj is SelectionChange<T> {
  return !!obj && obj.hasOwnProperty('added') && obj.hasOwnProperty('removed');
}

export interface TreeDataSourceMetadata extends BaseDataSourceMetadata {
  selectMultiple?: boolean;
  expandMultiple?: boolean;
}

export const RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD = new InjectionToken(
  'rxap/tree/data-source/root-remote-method'
);
export const RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD = new InjectionToken(
  'rxap/tree/data-source/children-remote-method'
);

@Injectable()
export class TreeDataSource<
  Data extends WithIdentifier & WithChildren = any,
  RootParameters = any
  > extends BaseDataSource<Array<Node<Data>>> {
  public tree$ = new BehaviorSubject<Array<Node<Data>>>([]);
  @Required public treeControl!: FlatTreeControl<Node<Data>>;
  public selected!: SelectionModel<Node<Data>>;
  public expanded!: SelectionModel<string>;

  private _expandedLocalStorageSubscription: Subscription | null = null;
  private _selectedLocalStorageSubscription: Subscription | null = null;

  // TODO : änlich problem wie bei der redundaten expand SelectionModel.
  // im localStorage wird nur die id gespeichert.
  private _preSelected: string[] = [];

  protected _data$ = new BehaviorSubject<Array<Node<Data>>>([]);
  public metadata!: TreeDataSourceMetadata;

  public loading$ = new ToggleSubject(true);

  public toDisplay: NodeToDisplayFunction<Data> = () =>
    'to display function not defined';
  public getIcon: NodeGetIconFunction<Data> = () => null;
  public hasDetails: NodeHasDetailsFunction<Data> = () => true;
  public matchFilter: (node: Node<Data>) => boolean = () => true;

  private _refreshMatchFilter = new Subject();

  constructor(
    @Inject(RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD)
    public readonly rootRemoteMethod: Method<Data | Data[], RootParameters>,
    @Inject(RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD)
    public readonly childrenRemoteMethod: Method<Data[], Node<Data>>,
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: TreeDataSourceMetadata | null = null
  ) {
    super(metadata);
    this.tree$
        .pipe(
          map((tree) =>
            tree
              .map((child) => this.flatTree(child))
              .reduce((acc, nodes) => [...acc, ...nodes], [])
          )
        )
        .subscribe(this._data$);

    // TODO add new SelectModel class that saves the select model to the localStorage
    this.initSelected();
    this.initExpanded();
  }

  public async getTreeRoot(): Promise<Array<Node<Data>>> {
    this.loading$.enable();
    const root: Data | Data[] = await this.getRoot();

    let rootNodes: Array<Node<Data>>;

    if (Array.isArray(root)) {
      rootNodes = await Promise.all(root.map((node) => this._toNode(node)));
    } else {
      rootNodes = [await this._toNode(root)];
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
    toDisplay: NodeToDisplayFunction<Data> = this.toDisplay
  ): void {
    this.toDisplay = toDisplay;
  }

  public setGetIcon(getIcon: NodeGetIconFunction<Data> = this.getIcon): void {
    this.getIcon = getIcon;
  }

  public setHasDetails(
    hasDetails: NodeHasDetailsFunction<Data> = this.hasDetails
  ): void {
    this.hasDetails = hasDetails;
  }

  public deselectNode(node: Node<Data>): Promise<void> {
    this.selected.deselect(node);
    return Promise.resolve();
  }

  // - the SelectModel that stores the selection into the local storage?
  public async _toNode(
    item: Data,
    depth: number = 0,
    onExpand: ExpandNodeFunction<Data> = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<Data> = this.collapseNode.bind(this),
    onSelect: ExpandNodeFunction<Data> = this.selectNode.bind(this),
    onDeselect: ExpandNodeFunction<Data> = this.deselectNode.bind(this)
  ): Promise<Node<Data>> {
    const node = await this.toNode(
      item,
      depth,
      onExpand,
      onCollapse,
      onSelect,
      onDeselect
    );

    if (this.expanded.isSelected(node.id)) {
      node
        .expand()
        .then(() => {
          // TODO : remove redundant this.expanded SelectionModel. Only store expanded nodes in this.treeControl.expansionModel
          // das problem ist das ich beim speicher in localStorage nur die id speicher.
          // Des wegen kann ich beim laden aus dem localStorage this.treeControl.expansionModel
          // nicht einfach mit den expanend nodes fullen. Da dort das node object benötigt wird
          // möglich lösungen:
          // - das node object läde die entity mithilfe der id automatisch nach
          this.treeControl.expansionModel.select(node);
          console.debug(`Restore expand for node '${node.id}' SUCCESSFULLY`);
        })
        .catch(() =>
          console.debug(`Restore expand for node '${node.id}' FAILED`)
        );
    }

    if (this._preSelected.includes(node.id)) {
      await node
        .select()
        .then(() =>
          console.debug(`Restore select for node '${node.id}' SUCCESSFULLY`)
        )
        .catch(() =>
          console.debug(`Restore select for node '${node.id}' FAILED`)
        );
    }

    return node;
  }

  public async expandNode(node: Node<Data>): Promise<void> {
    if (node.item.hasChildren && !node.item.children?.length) {
      node.isLoading$.enable();

      const children = await this.getChildren(node);

      // add the loaded children to the item object
      node.item.children = children;

      node.addChildren(
        await Promise.all(children.map((child) =>
          this._toNode(child, node.depth + 1, node.onExpand, node.onCollapse)
        ))
      );

      node.isLoading$.disable();
    }

    this.expanded.select(node.id);

    this.tree$.next(this.tree$.value);
  }

  public async getChildren(node: Node<Data>): Promise<Data[]> {
    return this.childrenRemoteMethod.call(node);
  }

  public async getRoot(): Promise<Data | Data[]> {
    const rootParameters = await this.getRootParameters();
    return this.rootRemoteMethod.call(rootParameters);
  }

  public async getRootParameters(): Promise<RootParameters> {
    return undefined as any;
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
    item: Data,
    depth: number = 0,
    onExpand: ExpandNodeFunction<Data> = this.expandNode.bind(this),
    onCollapse: ExpandNodeFunction<Data> = this.collapseNode.bind(this),
    onSelect: ExpandNodeFunction<Data> = this.selectNode.bind(this),
    onDeselect: ExpandNodeFunction<Data> = this.deselectNode.bind(this)
  ): Promise<Node<Data>> {
    return Node.ToNode(
      item,
      depth,
      onExpand,
      onCollapse,
      this.toDisplay,
      this.getIcon,
      onSelect,
      onDeselect,
      this.hasDetails
    );
  }

  public collapseNode(node: Node<Data>): Promise<void> {
    this.expanded.deselect(node.id);

    this.tree$.next(this.tree$.value);

    return Promise.resolve();
  }

  public flatTree(tree: Node<Data>): Array<Node<Data>> {
    function flat(acc: any[], list: any[]) {
      return [...acc, ...list];
    }

    const flatTree = (node: Node<Data>): Array<Node<Data>> => {
      if (!Array.isArray(node.children)) {
        console.log(node);
        throw new Error('Node has not defined children');
      }

      if (node.expanded || this.expanded.isSelected(node.id)) {
        return [
          node,
          ...node.children.map((child) => flatTree(child)).reduce(flat, []),
        ];
      } else {
        return [node];
      }
    };

    return flatTree(tree);
  }

  public destroy(): void {
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

  protected _connect(
    collectionViewer: Required<BaseDataSourceViewer>
  ): Observable<Array<Node<Data>>> {
    this.treeControl.expansionModel.changed.subscribe((change: any) => {
      if (isSelectionChange<Node<Data>>(change)) {
        if (change.added) {
          change.added.forEach((node) => node.expand());
        }
        if (change.removed) {
          change.removed
                .slice()
                .reverse()
                .forEach((node) => node.collapse());
        }
      }
    });

    let loadRoot: Promise<Array<Node<Data>> | void> = Promise.resolve();

    if (this.tree$.value.length === 0) {
      loadRoot = this.getTreeRoot();
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
                  .map((node) => node.select())
              );
            }
            if (!this.expanded.hasValue()) {
              promises.push(
                ...rootNodes
                  .filter((node) => node.hasChildren)
                  .map((node) => node.expand())
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
          map(() => this._data$.value)
        )
      ),
      switchMap(nodeList => this._refreshMatchFilter.pipe(
        startWith(null),
        map(() => nodeList.filter(node => this.matchFilter(node)))
      )),
    );
  }

  public async refresh(): Promise<any> {
    const rootNodes = await this.getTreeRoot();

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
        .map((node) => loadExpandedNodes(node.children))
    );

    const selected: Array<Node<Data>> = this.selected.selected
                                            .map((node) => this.getNodeById(node.id))
                                            .filter(Boolean) as any;
    this.selected.clear();
    this.selected.select(...selected);
  }

  private initSelected(): void {
    const key = joinPath('rxap/tree', this.id, 'selected');
    if (this.metadata.cacheSelected) {
      if (localStorage.getItem(key)) {
        try {
          this._preSelected = JSON.parse(localStorage.getItem(key)!);
        } catch (e) {
          console.debug('parse expanded tree data source nodes failed');
        }
      }
    }

    this.selected = new SelectionModel<Node<Data>>(
      !!this.metadata.selectMultiple,
      []
    );
    if (this.metadata.cacheSelected) {
      this._selectedLocalStorageSubscription = this.selected.changed
                                                   .pipe(
                                                     tap(() =>
                                                       localStorage.setItem(
                                                         key,
                                                         JSON.stringify(this.selected.selected.map((s) => s.id))
                                                       )
                                                     )
                                                   )
                                                   .subscribe();
    }
  }

  public reset(): any {
    this.selected.clear();
    this.expanded.clear();
    return this.getTreeRoot();
  }

  private initExpanded(): void {
    const key = joinPath('rxap/tree', this.id, 'expanded');
    let expanded = [];
    if (this.metadata.cacheExpanded) {
      if (localStorage.getItem(key)) {
        try {
          expanded = JSON.parse(localStorage.getItem(key)!);
        } catch (e) {
          console.debug('parse expanded tree data source nodes failed');
        }
      }
    }

    this.expanded = new SelectionModel<string>(
      this.metadata.expandMultiple !== false,
      expanded
    );
    if (this.metadata.cacheExpanded) {
      this._expandedLocalStorageSubscription = this.expanded.changed
                                                   .pipe(
                                                     tap(() =>
                                                       localStorage.setItem(key, JSON.stringify(this.expanded.selected))
                                                     )
                                                   )
                                                   .subscribe();
    }
  }
}
