import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectRowService } from '../select-row.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Showcase } from '@ng-prism/core';

@Showcase<CheckboxCellComponent<any>>({
  title: 'Checkbox Cell (Basic)',
  category: 'Table System (Basic)',
  description: 'Table cell with a checkbox that toggles the selection of the row element in the `SelectRowService`.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-checkbox-cell></td></tr></table>' },
  variants: [
    { name: 'Default', inputs: { element: { id: 'prism-row', name: 'Alice' } } },
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

  public readonly selected = computed(() => this.selectedRows().includes(this.element()));

}
