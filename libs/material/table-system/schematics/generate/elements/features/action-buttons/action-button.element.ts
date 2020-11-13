import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import {
  HandleComponent,
  HandleComponentModule,
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';
import { Rule } from '@angular-devkit/schematics';

@ElementDef('action')
export class ActionButtonElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    // TODO : mv TableRowControlsModule to rxap
    AddNgModuleImport(sourceFile, 'TableRowControlsModule', '@mfd/shared/table-row-controls/table-row-controls.module');
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}
