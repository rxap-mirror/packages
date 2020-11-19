import { AngularValidatorElement } from './angular-validator.element';
import {
  ElementDef,
  ElementTextContent,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('email')
export class EmailElement extends AngularValidatorElement {

  @ElementTextContent({
    parseValue: rawValue => `Validators.max(${rawValue})`
  })
  public validator!: string;

}
