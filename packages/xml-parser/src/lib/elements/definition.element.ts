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

/**
 * Parses an XML element to update and populate properties of a BaseDefinitionElement object.
 *
 * This function takes an XML element and extracts relevant data to populate or update the properties
 * of a given BaseDefinitionElement object. It specifically updates the 'id' and 'metadata' properties
 * of the BaseDefinitionElement. If the XML element contains an 'id' attribute, it updates the 'id' of
 * the BaseDefinitionElement. It also checks for a 'metadata' child node within the XML element, and if
 * present, iterates over its child nodes to populate the 'metadata' dictionary of the BaseDefinitionElement
 * with key-value pairs, where the key is the node name and the value is the text content of the node.
 *
 * @param {XmlParserService} parser - The XML parser service used to parse the XML document.
 * @param {RxapElement} element - The XML element that contains data to be parsed and used for updating the BaseDefinitionElement.
 * @param {BaseDefinitionElement} baseDefinitionElement - The BaseDefinitionElement object to be updated with data from the XML element.
 * @returns {BaseDefinitionElement} The updated BaseDefinitionElement object.
 */
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
