import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { AddNgModuleImport } from '../add-ng-module-import';
import {
  ElementDef,
  ElementChildTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { HandleComponentModule } from '../handle-component-module';
import { ToValueContext } from '../to-value-context';

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
    return () => {};
  }

}
