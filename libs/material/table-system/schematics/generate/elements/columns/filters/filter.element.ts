import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';

@ElementDef('filter')
export class FilterElement implements ParsedElement {

  public validate(): boolean {
    return true;
  }

}
