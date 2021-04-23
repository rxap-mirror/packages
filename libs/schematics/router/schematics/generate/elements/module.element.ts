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
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';

@ElementDef('module')
export class ModuleElement implements ParsedElement<Rule> {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public from!: string;

  public toValue({ project, options, sourceFile }: ToValueContext & { sourceFile: SourceFile }): Rule {
    AddNgModuleImport(sourceFile, this.name, this.from);
    return chain([]);
  }

}
