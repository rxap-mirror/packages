import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import {
  HandleComponent,
  HandleComponentModule,
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';

@ElementDef('action')
export class ActionButtonElement implements ParsedElement, HandleComponentModule, HandleComponent {

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    // TODO : mv TableRowControlsModule to rxap
    AddNgModuleImport(sourceFile, 'TableRowControlsModule', '@mfd/shared/table-row-controls/table-row-controls.module');
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public validate(): boolean {
    return true;
  }

}
