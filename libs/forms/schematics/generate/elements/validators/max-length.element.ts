import { AngularValidatorElement } from './angular-validator.element';
import {
  ElementDef,
  ElementTextContent,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('max-length')
export class MaxLengthElement extends AngularValidatorElement {

  @ElementTextContent({
    parseValue: rawValue => `Validators.maxLength(${rawValue})`
  })
  public validator!: string;

}
