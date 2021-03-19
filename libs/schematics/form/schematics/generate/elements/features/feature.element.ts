import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ClassDeclaration,
  SourceFile
} from 'ts-morph';
import { ToValueContext } from '@rxap/schematics-utilities';

export interface FeatureElementToValueContext extends ToValueContext {
  classDeclaration: ClassDeclaration
  sourceFile: SourceFile
}

@ElementDef('feature')
export class FeatureElement implements ParsedElement {

  public toValue(context: FeatureElementToValueContext): any {}

}
