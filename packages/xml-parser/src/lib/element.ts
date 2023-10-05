import { parseValue } from './parse-value';

export interface RxapElementOptions {
  withNamespace?: boolean;
  caseSensitive?: boolean;
}

export function normalizeNodeName(nodeName: string, options: RxapElementOptions): string {
  let name = nodeName;
  if (!options.caseSensitive) {
    name = name.toLowerCase();
  }
  if (!options.withNamespace) {
    name = name.replace(/[^:]+:/, '');
  }
  return name;
}

export class RxapElement {

  constructor(public readonly element: Element, public readonly options: RxapElementOptions = {}) {
  }

  public get name(): string {
    return this.normalizeNodeName(this.nodeName);
  }

  public get nodeName(): string {
    return this.element.nodeName;
  }

  public getString<T = undefined>(qualifiedName: string, defaultValue?: T): T | string {
    if (this.element.hasAttribute(qualifiedName)) {
      return this.element.getAttribute(qualifiedName) as string;
    }
    return defaultValue as any;
  }

  public get<D = undefined, T = any>(qualifiedName: string, defaultValue?: D, raw = false): T | D {
    if (this.element.hasAttribute(qualifiedName)) {
      const value = this.element.getAttribute(qualifiedName)!;
      return raw ? value : parseValue(value) as any;
    }
    return defaultValue as any;
  }

  public hasName(name: string): boolean {
    return this.name === this.normalizeNodeName(name);
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
    return !!this.getChild(nodeName);
  }

  public getAllChildNodes(): RxapElement[] {
    return Array.from(this.element.childNodes)
                .filter(n => !!n.nodeName && n.nodeType === 1)
      .map((child: ChildNode) => new RxapElement(child as any, this.options));
  }

  public getCountChildren(): number {
    return Array.from(this.element.childNodes).filter(n => !!n.nodeName && n.nodeType === 1).length;
  }

  public getChildren(...nodeNames: string[]): RxapElement[] {
    return this.getAllChildNodes().filter(
      e => nodeNames.map(nodeName => this.normalizeNodeName(nodeName)).includes(e.name));
  }

  public getChild(nodeName: string): RxapElement | undefined {
    return this.getAllChildNodes().find(e => e.hasName(nodeName));
  }

  public getTextContent<T = string>(defaultValue?: any, raw = false): T {
    const textContent = this.element.textContent === null || this.element.textContent === '' ?
      defaultValue :
      this.element.textContent;
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

  public getChildTextContent<T = string>(nodeName: string, defaultValue?: any, raw = false): T {
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

  public normalizeNodeName(nodeName: string): string {
    return normalizeNodeName(nodeName, this.options);
  }

}
