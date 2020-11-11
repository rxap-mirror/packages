import { ParsedElement } from '@rxap/xml-parser';
import { ToValueContext } from '../types';
import { Required } from '@rxap/utilities';
import { ObjectLiteralExpression } from 'ts-morph';
import {
  ElementDef,
  ElementTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { AddControlValidator } from '@rxap-schematics/utilities';

export interface ValidatorToValueContext extends ToValueContext {
  controlOptions: ObjectLiteralExpression
}

@ElementDef('validator')
export class ValidatorElement implements ParsedElement {

  @ElementTextContent()
  @ElementRequired()
  public validator!: string;

  public toValue({ controlOptions }: ValidatorToValueContext): any {
    AddControlValidator(this.validator, controlOptions);
  }

}
