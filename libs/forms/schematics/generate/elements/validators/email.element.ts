import { AngularValidatorElement } from './angular-validator.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('email')
export class EmailElement extends AngularValidatorElement {

  public validator: string = 'Validators.email';

}
