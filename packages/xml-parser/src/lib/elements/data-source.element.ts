import {ParsedElement} from './parsed-element';
import {ElementTextContent} from '../decorators/element-text-content';
import {ElementRequired} from '../decorators/mixins/required-element.parser.mixin';
import {ElementDef} from '../decorators/element-def';

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

