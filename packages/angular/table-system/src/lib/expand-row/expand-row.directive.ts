import { Directive, computed, input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpandRowService } from './expand-row.service';

@Directive({
  selector: 'tr[rxapExpandRow]',
  standalone: true,
  host: {
    '[class.expanded-row]': 'expanded()',
    '(click)': 'onClick()',
  },
})
export class ExpandRowDirective<Data extends Record<string, any>> {
  private readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);

  public readonly element = input.required<Data>({ alias: "rxapExpandRow" });

  // a signal is required for the host binding: the expanded row can be changed from outside this
  // directive (e.g. by another row or programmatically) and without zone.js nothing else would
  // mark the view of this row as dirty
  private readonly expandedRow = toSignal(this.expandCell.expandedRow, { requireSync: true });

  protected readonly expanded = computed(() => this.expandedRow() === this.element());

  public get isExpanded() {
    return this.expandCell.isExpanded(this.element());
  }

  public onClick() {
    this.expandCell.toggleRow(this.element());
  }

}
