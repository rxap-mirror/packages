import { ToggleSubject } from '@rxap/rxjs';
import {
  coerceArray,
  getIdentifierPropertyValue,
  IconConfig,
  WithChildren,
  WithIdentifier,
} from '@rxap/utilities';

export interface EventOptions {
  withChildren?: boolean;
  quite?: boolean;
  onlySelf?: boolean;
}

export type ExpandNodeFunction<T> = (node: Node<T>, options: EventOptions) => Promise<any>;

export type NodeToDisplayFunction<T extends WithIdentifier & WithChildren> = (item: T) => string;

export type NodeGetTypeFunction<T extends WithIdentifier & WithChildren> = (item: T) => string | null;

export type NodeGetIconFunction<T extends WithIdentifier & WithChildren> = (item: T) => IconConfig | IconConfig[] | null;

export type NodeGetStyleFunction<T extends WithIdentifier & WithChildren> = (item: T) => Record<string, string>;

export type NodeHasDetailsFunction<T extends WithIdentifier & WithChildren> = (item: T) => boolean;

export interface ShowHideOptions {
  /**
   * If true the show/hide operation will only be applied to the node itself
   */
  onlySelf?: boolean;
  /**
   * If true the show/hide operation will be applied to all **direct** children
   */
  forEachChild?: boolean;
  /**
   * If true the show/hide operation will be applied to the direct parent
   */
  parent?: boolean;
  /**
   * If true the show/hide operation will be applied to all children (children of children)
   */
  forEachChildren?: boolean;
  /**
   * If true the show/hide operation will be applied to all parents (parent of parent)
   */
  parents?: boolean;
}

export class Node<T extends WithIdentifier & WithChildren, CustomParameters = any> {

  constructor(
    public readonly parent: Node<T> | null,
    public readonly item: T & WithChildren,
    children: Array<Node<T>>,
    private _depth: number,
    public onExpand: ExpandNodeFunction<T>,
    public onCollapse: ExpandNodeFunction<T>,
    public display: string | null = null,
    public icon: IconConfig[] | null = null,
    public type: string | null = null,
    public onSelect: ExpandNodeFunction<T> | null = null,
    public onDeselect: ExpandNodeFunction<T> | null = null,
    public hasDetails: boolean = true,
    public style: Record<string, string> = {},
    /**
     * Custom parameters passed to all child mode to transport non-standard
     * information to allow custom implementations
     */
    private _parameters: CustomParameters | null = null,
    // TODO : move property before _parameters (refactor)
    public hidden: boolean = false,
  ) {
    this.setChildren(children);
    const identifier = getIdentifierPropertyValue(this.item);

    if (identifier === null) {
      throw new Error('Node item has not an identifier property');
    }
    this.id = identifier;
  }

  public readonly isLoading$ = new ToggleSubject();

  public readonly id: string;

  public get depth(): number {
    return this._depth;
  }

  public get children(): ReadonlyArray<Node<T>> {
    return this._children;
  }

  public get hasVisibleChildren(): boolean {
    return this._children.some(child => child.isVisible);
  }

  public get isHidden(): boolean {
    return this.hidden || (
      this.hasChildren && !this.hasVisibleChildren
    );
  }

  public get isVisible(): boolean {
    if (this.hasChildren) {
      return !this.hidden || this.hasVisibleChildren;
    } else {
      return !this.hidden;
    }
  }

  private _expanded = false;

  public get expanded(): boolean {
    return this._expanded;
  }

  private _selected = false;

  public get selected(): boolean {
    return this._selected;
  }

  public hasChildren = false;

  public get parameters(): CustomParameters | null {
    return this._parameters;
  }

  public set parameters(parameters: CustomParameters | null) {
    this._parameters = parameters;
    this.children.forEach(child => child.parameters = parameters);
  }

  private _children: ReadonlyArray<Node<T>> = Object.freeze([]);

  public static ToNode<T extends WithIdentifier & WithChildren, CustomParameters = any>(
    parent: Node<T> | null,
    item: T & WithChildren,
    depth: number,
    onExpand: ExpandNodeFunction<T>,
    onCollapse: ExpandNodeFunction<T>,
    toDisplay: NodeToDisplayFunction<T> = () => 'to display function not defined',
    getIcon: NodeGetIconFunction<T> = () => null,
    getType: NodeGetTypeFunction<T> = () => null,
    onSelect: ExpandNodeFunction<T> | null = null,
    onDeselect: ExpandNodeFunction<T> | null = null,
    hasDetails: NodeHasDetailsFunction<T> = () => true,
    getStyle: NodeGetStyleFunction<T> = () => ({}),
    parameters: CustomParameters | null = null,
  ): Node<T, CustomParameters> {
    const node = new Node<T>(
      parent,
      item,
      [],
      depth,
      onExpand,
      onCollapse,
      toDisplay(item),
      coerceArray(getIcon(item)),
      getType(item),
      onSelect,
      onDeselect,
      hasDetails(item),
      getStyle(item),
      parameters,
    );
    const children = (item.children ?? []).map((child: any) => Node.ToNode(
      node,
      child,
      depth + 1,
      onExpand,
      onCollapse,
      toDisplay,
      getIcon,
      getType,
      onSelect,
      onDeselect,
      hasDetails,
      getStyle,
      parameters,
    ));
    node.setChildren(children);
    return node;
  }

  public setDepth(depth: number): void {
    this._depth = depth;
    this.children.forEach(child => child.setDepth(this.depth + 1));
  }

  public addChild(child: Node<T>, end = false): void {
    const children = this.children.slice();
    if (end) {
      children.unshift(child);
    } else {
      children.push(child);
    }
    this.setChildren(children);
  }

  public addChildren(newChildren: Array<Node<T>>, end = false): void {
    const children = this.children.slice();
    if (end) {
      children.unshift(...newChildren);
    } else {
      children.push(...newChildren);
    }
    this.setChildren(children);
  }

  public setChildren(children: Array<Node<T>>): void {
    children.forEach(child => {
      child.setDepth(this.depth + 1);
      child.onCollapse = this.onCollapse;
      child.onExpand = this.onExpand;
    });
    this._children = Object.freeze(children
        .filter((child, index, nodes) => nodes.findIndex(node => node.id === child.id) === index)
      // .sort((a, b) => a.hasChildren === b.hasChildren ? 0 : a.hasChildren ? -1 : 1),
    );
    this.hasChildren = this._children.length !== 0 || this.item.hasChildren;
  }

  public clearChildren(): void {
    this._children = Object.freeze([]);
    this.hasChildren = this.item.hasChildren;
  }

  public isNode(id: string): boolean {
    return this.id === id;
  }

  public hasNode(id: string): boolean {
    return this.isNode(id) || this.children.some(child => child.hasNode(id));
  }

  public getNode(id: string): Node<T> | null {
    if (this.isNode(id)) {
      return this;
    }
    return this.children.map(child => child.getNode(id)).filter(Boolean)[0] || null;
  }

  public toggleExpand(options: EventOptions = {}): Promise<any> {
    if (this.expanded) {
      return this.collapse(options);
    } else {
      return this.expand(options);
    }
  }

  public expand(options: EventOptions = {}): Promise<any> {
    this._expanded = true;
    return this.onExpand(this, options);
  }

  public select(options: EventOptions = {}): Promise<any> {
    this._selected = true;
    return this.onSelect ? this.onSelect(this, options) : Promise.resolve();
  }

  public deselect(options: EventOptions = {}): Promise<any> {
    this._selected = false;
    return this.onDeselect ? this.onDeselect(this, options) : Promise.resolve();
  }

  public toggleSelect(): Promise<any> {
    if (this.selected) {
      return this.deselect();
    } else {
      return this.select();
    }
  }

  public collapse(options: EventOptions = {}): Promise<any> {
    this._expanded = false;
    return this.onCollapse(this, options);
  }

  public hide(options: ShowHideOptions = {}) {
    this.hidden = true;
    if (!options.onlySelf) {
      if (options.forEachChild || options.forEachChildren) {
        this.forEachChild(child => child.hide({
          ...options,
          forEachChild: false,
          forEachChildren: !!options.forEachChildren,
        }));
      }
      if (options.parent || options.parents) {
        this.parent?.hide({
          ...options,
          parent: false,
          parents: !!options.parents,
        });
      }
    }
  }

  public show(options: ShowHideOptions = {}) {
    this.hidden = false;
    if (!options.onlySelf) {
      if (options.forEachChild || options.forEachChildren) {
        this.forEachChild(child => child.show({
          ...options,
          forEachChild: false,
          forEachChildren: !!options.forEachChildren,
        }));
      }
      if (options.parent || options.parents) {
        this.parent?.show({
          ...options,
          parent: false,
          parents: !!options.parents,
        });
      }
    }
  }

  public forEachChild(fn: (child: Node<T>) => void) {
    for (const child of this.children) {
      fn(child);
      child.forEachChild(fn);
    }
  }

}
