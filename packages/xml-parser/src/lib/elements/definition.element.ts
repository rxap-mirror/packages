import { ParsedElement } from './parsed-element';
import { ElementAttribute } from '../decorators/element-attribute';
import { XmlParserService } from '../xml-parser.service';
import { RxapElement } from '../element';


export abstract class BaseDefinitionElement implements ParsedElement {

  @ElementAttribute()
  public id!: string;

  public metadata: Partial<any> = {};

  constructor(id?: string) {
    if (id) {
      this.id = id;
    }
  }

  public getMetaData(): any {
    return {
      ...this.metadata,
      id: this.id,
    };
  }

  public abstract validate(): boolean;

}

export function ParseBaseDefinitionElement(
  parser: XmlParserService,
  element: RxapElement,
  baseDefinitionElement: BaseDefinitionElement,
): BaseDefinitionElement {

  baseDefinitionElement.id = element.getString('id', baseDefinitionElement.id);

  if (element.hasChild('metadata')) {
    const metadataElement = element.getChild('metadata')!;
    for (const child of metadataElement.getAllChildNodes()) {
      baseDefinitionElement.metadata[child.name] = child.getTextContent();
    }
  }

  return baseDefinitionElement;
}
