import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectRowService } from '../select-row.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Showcase } from '@ng-prism/core';

@Showcase<CheckboxCellComponent<any>>({
  title: 'Checkbox Cell',
  category: 'Table System',
  description: 'Table cell with a checkbox that toggles the selection of the row element in the `SelectRowService`.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-checkbox-cell></td></tr></table>' },
  variants: [
    { name: 'Not selected', inputs: { element: { uuid: 'prism-row', name: 'Alice' } } },
    { name: 'Selected', description: 'The row is selected by the provided select row options.', inputs: { element: { uuid: 'prism-selected', name: 'Bob' } } },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-checkbox-cell]',
    templateUrl: './checkbox-cell.component.html',
    styleUrls: ['./checkbox-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCheckboxModule]
})
export class CheckboxCellComponent<Data extends Record<string, any>> {
  readonly selectRow = inject<SelectRowService<Data>>(SelectRowService);


  public readonly element = input.required<Data>();

  private readonly selectedRows = toSignal(this.selectRow.selectedRows$, { initialValue: this.selectRow.selectedRows });

  public readonly isSelected = computed(() => {
    this.selectedRows();
    return this.selectRow.selectionModel.isSelected(this.element());
  });

}
