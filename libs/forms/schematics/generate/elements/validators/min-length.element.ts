import { AngularValidatorElement } from './angular-validator.element';
import {
  ElementDef,
  ElementTextContent,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('min-length')
export class MinLengthElement extends AngularValidatorElement {

  @ElementTextContent({
    parseValue: rawValue => `Validators.minLength(${rawValue})`
  })
  public validator!: string;

}
