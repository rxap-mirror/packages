import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ToValueContext } from '../../to-value-context';

@ElementDef('method')
export class MethodElement implements ParsedElement<string> {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public from?: string;

  public toValue({ sourceFile }: { sourceFile: SourceFile } & ToValueContext): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
    }

    return this.name;
  }

}
