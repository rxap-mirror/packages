import {
  ElementDef,
  ElementTextContent,
  ElementRequired,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { AngularValidatorElement } from './angular-validator.element';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('pattern')
export class PatternElement extends AngularValidatorElement {

  @ElementTextContent({
    parseValue: rawValue => `Validators.pattern(${rawValue})`
  })
  public validator!: string;

}
