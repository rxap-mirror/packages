import { AngularValidatorElement } from './angular-validator.element';
import {
  ElementDef,
  ElementTextContent,
  ElementRequired,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('min')
export class MinElement extends AngularValidatorElement {

  @ElementTextContent({
    parseValue: rawValue => `Validators.min(${rawValue})`
  })
  public validator!: string;

}
