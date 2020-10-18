import {
  WithIdentifier,
  WithChildren,
  getIdentifierPropertyValue,
  IconConfig
} from './helpers';
import { ToggleSubject } from './toggle-subject';

export type ExpandNodeFunction<T> = (node: Node<T>) => Promise<any>;

export type NodeToDisplayFunction<T extends WithIdentifier & WithChildren> = (item: T) => string;

export type NodeGetIconFunction<T extends WithIdentifier & WithChildren> = (item: T) => IconConfig | null;

export type NodeHasDetailsFunction<T extends WithIdentifier & WithChildren> = (item: T) => boolean;

export class Node<T extends WithIdentifier & WithChildren> {

  public static ToNode<T extends WithIdentifier & WithChildren>(
    item: T & WithChildren,
    depth: number,
    onExpand: ExpandNodeFunction<T>,
    onCollapse: ExpandNodeFunction<T>,
    toDisplay: NodeToDisplayFunction<T>      = () => 'to display function not defined',
    getIcon: NodeGetIconFunction<T>          = () => null,
    onSelect: ExpandNodeFunction<T> | null   = null,
    onDeselect: ExpandNodeFunction<T> | null = null,
    hasDetails: NodeHasDetailsFunction<T>    = () => true
  ): Node<T> {
    const children = (item.children ?? []).map((child: any) => Node.ToNode(
      child,
      depth + 1,
      onExpand,
      onCollapse,
      toDisplay,
      getIcon,
      onSelect,
      onDeselect,
      hasDetails
    ));
    return new Node<T>(
      item,
      children,
      depth,
      onExpand,
      onCollapse,
      toDisplay(item),
      getIcon(item),
      onSelect,
      onDeselect,
      hasDetails(item)
    );
  }

  public readonly isLoading$ = new ToggleSubject();

  public readonly id: string;

  public get depth(): number {
    return this._depth;
  }

  public get children(): ReadonlyArray<Node<T>> {
    return this._children;
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

  private _children: ReadonlyArray<Node<T>> = Object.freeze([]);

  constructor(
    public readonly item: T & WithChildren,
    children: Array<Node<T>>,
    private _depth: number,
    public onExpand: ExpandNodeFunction<T>,
    public onCollapse: ExpandNodeFunction<T>,
    public display: string | null                   = null,
    public icon: IconConfig | null                  = null,
    public onSelect: ExpandNodeFunction<T> | null   = null,
    public onDeselect: ExpandNodeFunction<T> | null = null,
    public hasDetails: boolean                      = true
  ) {
    this.setChildren(children);
    const identifier = getIdentifierPropertyValue(this.item);

    if (identifier === null) {
      throw new Error('Node item has not an identifier property');
    }
    this.id = identifier;
  }

  public setDepth(depth: number): void {
    this._depth = depth;
    this.children.forEach(child => child.setDepth(this.depth + 1));
  }

  public addChild(child: Node<T>, end: boolean = false): void {
    const children = this.children.slice();
    if (end) {
      children.unshift(child);
    } else {
      children.push(child);
    }
    this.setChildren(children);
  }

  public addChildren(newChildren: Array<Node<T>>, end: boolean = false): void {
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
      child.onExpand   = this.onExpand;
    });
    this._children   = Object.freeze(children
      .filter((child, index, nodes) => nodes.findIndex(node => node.id === child.id) === index)
      .sort((a, b) => a.hasChildren === b.hasChildren ? 0 : a.hasChildren ? -1 : 1)
    );
    this.hasChildren = this._children.length !== 0 || this.item.hasChildren;
  }

  public clearChildren(): void {
    this._children   = Object.freeze([]);
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
    return this.children.map(child => child.getNode(id)).filter(Boolean)[ 0 ] || null;
  }

  public toggleExpand(): Promise<any> {
    if (this.expanded) {
      return this.collapse();
    } else {
      return this.expand();
    }
  }

  public expand(): Promise<any> {
    this._expanded = true;
    return this.onExpand(this);
  }

  public select(): Promise<any> {
    this._selected = true;
    return this.onSelect ? this.onSelect(this) : Promise.resolve();
  }

  public deselect(): Promise<any> {
    this._selected = false;
    return this.onDeselect ? this.onDeselect(this) : Promise.resolve();
  }

  public toggleSelect(): Promise<any> {
    if (this.selected) {
      return this.deselect();
    } else {
      return this.select();
    }
  }

  public collapse(): Promise<any> {
    this._expanded = false;
    return this.onCollapse(this);
  }

}
