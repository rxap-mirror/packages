import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementDef,
  ElementTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';

@ElementDef('data-source')
export class DataSourceElement implements ParsedElement {

  public __tag!: string;

  @ElementTextContent()
  @ElementRequired()
  public id!: string;

  public validate(): boolean {
    return true;
  }

}

