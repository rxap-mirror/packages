import { ParsedElement } from '@rxap/xml-parser';
import { Rule, noop } from '@angular-devkit/schematics';
import {
  ElementDef,
  ElementChildTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  ToValueContext,
  HandleComponentModule,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';

@ElementDef('module')
export class ModuleElement implements ParsedElement<Rule>, HandleComponentModule {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public form?: string;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, this.name, this.form);
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return noop();
  }

}
