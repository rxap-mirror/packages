import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { Required } from '@rxap/utilities';
import { SelectRowService } from '../select-row.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-checkbox-cell]',
    templateUrl: './checkbox-cell.component.html',
    styleUrls: ['./checkbox-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [MatCheckboxModule]
})
export class CheckboxCellComponent<Data extends Record<string, any>> {
  readonly selectRow = inject<SelectRowService<Data>>(SelectRowService);


  public readonly element = input.required<Data>();

}
