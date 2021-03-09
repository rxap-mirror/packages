import {
  ElementDef,
  ElementChildTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  chain
} from '@angular-devkit/schematics';
import { ToValueContext } from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';

@ElementDef('component')
export class ComponentElement implements ParsedElement<Rule> {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public from?: string;

  public toValue({ project, options, sourceFile }: ToValueContext & { sourceFile: SourceFile }): Rule {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
    }
    return chain([]);
  }

}
