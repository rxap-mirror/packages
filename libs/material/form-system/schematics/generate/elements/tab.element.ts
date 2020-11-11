import { NodeElement } from './node.element';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  WithTemplate,
  StringOrFactory
} from '@rxap-schematics/utilities';

@ElementDef('tab')
export class TabElement implements ParsedElement {

  @ElementChildTextContent()
  @ElementRequired()
  public label!: string;

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public template(): string {
    return NodeFactory('mat-tab', `label="${this.label}"`)([ ...this.nodes, '\n' ]);
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

}

@ElementExtends(NodeElement)
@ElementDef('tab-group')
export class TabGroup implements WithTemplate, ParsedElement {

  @ElementChildren(TabElement)
  public tabs!: TabElement[];

  public validate(): boolean {
    return this.tabs && this.tabs.length !== 0;
  }

  public template(...attributes: StringOrFactory[]): string {
    return NodeFactory('mat-tab-group')(this.tabs);
  }

}
