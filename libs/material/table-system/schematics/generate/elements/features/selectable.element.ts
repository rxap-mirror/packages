import {
  DisplayColumn,
  FeatureElement
} from './feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';

@ElementExtends(FeatureElement)
@ElementDef('selectable')
export class SelectableElement extends FeatureElement {

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'SelectRowModule', '@rxap/table-system');
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name: 'select',
      hidden: true
    };
  }

  public columnTemplate(): string {
    return `
    <ng-container matColumnDef="select" sticky>
      <th mat-header-cell rxap-checkbox-header-cell *matHeaderCellDef></th>
      <td mat-cell rxap-checkbox-cell [element]="element" *matCellDef="let element"></td>
    </ng-container>
    `;
  }

  public columnTemplateFilter(): string {
    return FeatureElement.ColumnNoFilter('select', true);
  }

}
