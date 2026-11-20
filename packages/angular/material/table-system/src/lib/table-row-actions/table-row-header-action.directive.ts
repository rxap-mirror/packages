import {
  Directive,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  map,
  startWith,
} from 'rxjs/operators';
import { SelectRowService } from '../select-row/select-row.service';
import { AbstractTableRowAction } from './abstract-table-row-action';

@Directive({
  selector: 'button[rxapTableRowHeaderAction]',
  standalone: true,
})
export class TableRowHeaderActionDirective<Data extends Record<string, any>>
  extends AbstractTableRowAction<Data> {
  private readonly selectRowService = inject<SelectRowService<Data> | null>(SelectRowService, { optional: true });

  public override readonly isHeader = true;

  public readonly type = input.required<string>({ alias: 'rxapTableRowHeaderAction' });

  private readonly hasSelectedRows = this.selectRowService ?
    toSignal(
      this.selectRowService.selectedRows$.pipe(
        startWith(this.selectRowService.selectedRows),
        map((rows) => rows.length !== 0),
      ),
      { initialValue: this.selectRowService.selectedRows.length !== 0 },
    ) :
    () => false;

  constructor() {
    super();
    effect(() => {
      if (this.hasSelectedRows()) {
        this.setButtonEnabled();
      } else {
        this.setButtonDisabled();
      }
    });
  }

  protected override getElementList(): Data[] {
    return this.selectRowService?.selectedRows ?? [];
  }

}
