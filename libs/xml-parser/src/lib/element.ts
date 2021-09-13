import { parseValue } from './parse-value';

export class RxapElement {

  public get name(): string {
    return this.element.nodeName.toLowerCase().replace(/[^:]+:/, '');
  }

  public get nodeName(): string {
    return this.element.nodeName;
  }

  constructor(public readonly element: Element) {}

  public getString<T = undefined>(qualifiedName: string, defaultValue?: T): T | string {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) as string;
    }
    return defaultValue as any;
  }

  public get<D = undefined, T = any>(qualifiedName: string, defaultValue?: D, raw: boolean = false): T | D {
    if (this.element.hasAttribute(qualifiedName)) {
      const value = this.element.getAttribute(qualifiedName)!;
      return raw ? value : parseValue(value) as any;
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

  public getBoolean(qualifiedName: string, defaultValue?: boolean): boolean | undefined {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) !== 'false';
    }
    return defaultValue;
  }

  public has(qualifiedName: string): boolean {
    return this.element.hasAttribute(qualifiedName);
  }

  public hasChildren(): boolean {
    return this.getAllChildNodes().length !== 0;
  }

  public hasChild(nodeName: string): boolean {
    return this.getAllChildNodes().find(n => n.name === nodeName.toLowerCase()) !== undefined;
  }

  public getAllChildNodes(): RxapElement[] {
    return Array.from(this.element.childNodes)
                .filter(n => !!n.nodeName && n.nodeType === 1)
                .map((child: ChildNode) => new RxapElement(child as any));
  }

  public getCountChildren(): number {
    return Array.from(this.element.childNodes).filter(n => !!n.nodeName && n.nodeType === 1).length;
  }

  public getChildren(...nodeNames: string[]): RxapElement[] {
    return this.getAllChildNodes().filter(e => nodeNames.map(nodeName => nodeName.toLowerCase()).includes(e.name));
  }

  public getChild(nodeName: string): RxapElement | undefined {
    return this.getAllChildNodes().find(e => e.name === nodeName.toLowerCase());
  }

  public getTextContent<T = string>(defaultValue?: any, raw: boolean = false): T {
    const textContent = this.element.textContent === null || this.element.textContent === '' ? defaultValue : this.element.textContent;
    return textContent !== undefined ? raw ? textContent.trim() : parseValue(textContent.trim()) : undefined as any;
  }

  public getRawContent(): string {
    return Array.from(this.element.childNodes).map(child => child.toString()).join('');
  }

  public getChildRawContent(nodeName: string, defaultValue?: string): string {
    if (this.hasChild(nodeName)) {
      return this.getChild(nodeName)!.getRawContent();
    }
    return defaultValue ?? '';
  }

  public getChildTextContent<T = string>(nodeName: string, defaultValue?: any, raw: boolean = false): T {
    if (this.hasChild(nodeName)) {
      return this.getChild(nodeName)!.getTextContent(defaultValue, raw) ?? defaultValue;
    }
    return defaultValue as any;
  }

  public getChildrenTextContent<T = string>(nodeName: string, defaultValue?: any): T[] {
    if (this.hasChild(nodeName)) {
      return this.getChildren(nodeName)!.map(child => child.getTextContent(defaultValue));
    }
    return [];
  }

}
