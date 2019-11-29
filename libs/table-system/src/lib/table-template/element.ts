export class RxapElement {

  public get name(): string {
    return this.element.nodeName;
  }

  public get textContent(): string | null {
    return this.element.textContent;
  }

  constructor(public readonly element: Element) {}

  public getString(qualifiedName: string): string | undefined {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) as string;
    }
    return undefined;
  }

  public getParsedContent<T = any>(): T {
    const value = this.textContent;
    if (value === 'true' || value === 'false') {
      return (value === 'true') as any;
    }
    if (value === '') {
      return value as any;
    }
    if (!isNaN(Number(value))) {
      return Number(value) as any;
    }
    return value as any;
  }

  public get<T = any>(qualifiedName: string): T | undefined {
    if (this.element.hasAttribute(qualifiedName)) {
      const value = this.element.getAttribute(qualifiedName)!;
      if (value === 'true' || value === 'false') {
        return (value === 'true') as any;
      }
      if (value === '') {
        return value as any;
      }
      if (!isNaN(Number(value))) {
        return Number(value) as any;
      }
      return value as any;
    }
    return undefined;
  }

  public getNumber(qualifiedName: string): number | undefined {
    if (this.element.hasAttribute(qualifiedName)) {
      return Number(this.element.getAttribute(qualifiedName));
    }
    return undefined;
  }

  public getBoolean(qualifiedName: string): boolean {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) === 'true' || this.element.getAttribute(qualifiedName) === '';
    }
    return false;
  }

  public has(qualifiedName: string): boolean {
    return this.element.hasAttribute(qualifiedName);
  }

  public hasChildren(): boolean {
    return this.element.hasChildNodes();
  }

  public hasChild(nodeName: string): boolean {
    return Array.from(this.element.childNodes).find(n => n.nodeName === nodeName) !== undefined;
  }

  public getAllChildNodes(): RxapElement[] {
    return Array.from(this.element.childNodes).filter(n => !!n.nodeName).map((child: ChildNode) => new RxapElement(child as any));
  }

  public getChildren(nodeName: string): RxapElement[] {
    return this.getAllChildNodes().filter(e => e.name === nodeName);
  }

  public getChild(nodeName: string): RxapElement | undefined {
    return this.getAllChildNodes().find(e => e.name === nodeName);
  }

}
