import { ParsedElement } from '@rxap/xml-parser';
import {
  ObjectLiteralExpression,
  SourceFile
} from 'ts-morph';
import {
  ElementDef,
  ElementTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  AddControlValidator,
  ToValueContext
} from '@rxap/schematics-utilities';

export interface ValidatorToValueContext extends ToValueContext {
  controlOptions: ObjectLiteralExpression;
  sourceFile: SourceFile;
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
