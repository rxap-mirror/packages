import {ElementChildTextContent, ElementDef, ElementRequired, ParsedElement} from '@rxap/xml-parser';
import {noop, Rule} from '@angular-devkit/schematics';
import {SourceFile} from 'ts-morph';
import {AddNgModuleImport, HandleComponentModule, ToValueContext} from '@rxap/schematics-ts-morph';

@ElementDef('module')
export class ModuleElement implements ParsedElement<Rule>, HandleComponentModule {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public form?: string;

  public handleComponentModule({sourceFile, project, options}: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, this.name, this.form);
  }

  public toValue({project, options}: ToValueContext): Rule {
    return noop();
  }

}
