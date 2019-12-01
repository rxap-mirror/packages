export class RxapElement {

  public get name(): string {
    return this.element.nodeName;
  }

  public get textContent(): string | null {
    return this.element.textContent;
  }

  constructor(public readonly element: Element) {}

  public getString<T = undefined>(qualifiedName: string, defaultValue?: T): T | string {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) as string;
    }
    return defaultValue as any;
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

  public get<D = undefined, T = any>(qualifiedName: string, defaultValue?: D): T | D {
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

      // test if string
      if (value[ 0 ] === '\'' && value[ value.length - 1 ] === '\'') {
        return value.substr(1, value.length - 2) as any;
      } else {
        try {
          return JSON.parse(value);
        } finally {}
      }

      return value as any;
    }
    return defaultValue as any;
  }

  public getDate(qualifiedName: string): number | undefined {
    return undefined;
  }

  public getNumber<T = undefined>(qualifiedName: string, defaultValue?: T): number | T {
    if (this.element.hasAttribute(qualifiedName)) {
      return Number(this.element.getAttribute(qualifiedName));
    }
    return defaultValue as any;
  }

  public getBoolean(qualifiedName: string, defaultValue: boolean = false): boolean {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) === 'true' || this.element.getAttribute(qualifiedName) === '';
    }
    return defaultValue;
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
    return Array.from(this.element.childNodes)
                .filter(n => !!n.nodeName && n.nodeType === 1)
                .map((child: ChildNode) => new RxapElement(child as any));
  }

  public getChildren(nodeName: string): RxapElement[] {
    return this.getAllChildNodes().filter(e => e.name === nodeName);
  }

  public getChild(nodeName: string): RxapElement | undefined {
    return this.getAllChildNodes().find(e => e.name === nodeName);
  }

}
