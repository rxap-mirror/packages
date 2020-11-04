import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { ToValueContext } from '../types';
import { ClassDeclaration } from 'ts-morph';

export interface FeatureElementToValueContext extends ToValueContext {
  classDeclaration: ClassDeclaration
}

@ElementDef('feature')
export class FeatureElement implements ParsedElement {

  public toValue(context: FeatureElementToValueContext): any {}

}
