import {
  DisplayColumn,
  FeatureElement
} from './feature.element';
import {
  ElementDef,
  ElementExtends,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import {
  SourceFile,
  Writers
} from 'ts-morph';
import {
  AddNgModuleImport,
  ToValueContext,
  AddComponentProvider
} from '@rxap-schematics/utilities';

@ElementExtends(FeatureElement)
@ElementDef('selectable')
export class SelectableElement extends FeatureElement {

  @ElementAttribute()
  public multiple?: boolean;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'SelectRowModule', '@rxap/table-system');
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.multiple !== undefined) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS',
          useValue: Writers.object({
            multiple: this.multiple ? 'true' : 'false'
          })
        },
        []
      );
    }
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name:   'select',
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
