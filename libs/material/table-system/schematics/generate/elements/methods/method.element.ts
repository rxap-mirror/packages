import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ToValueContext } from '@rxap-schematics/utilities';

@ElementDef('remote-method')
export class MethodElement implements ParsedElement<string> {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute('import')
  @ElementRequired()
  public importForm!: string;

  public toValue({ sourceFile }: { sourceFile: SourceFile } & ToValueContext): string {
    sourceFile.addImportDeclaration({
      namedImports: [ this.name ],
      moduleSpecifier: this.importForm
    });

    return this.name;
  }

}
