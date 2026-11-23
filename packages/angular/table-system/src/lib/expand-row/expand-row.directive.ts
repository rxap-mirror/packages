import { Directive, computed, input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpandRowService } from './expand-row.service';
import { Showcase } from '@ng-prism/core';

@Showcase<ExpandRowDirective<any>>({
  title: 'Expand Row (Basic)',
  category: 'Table System (Basic)',
  description: 'Table row that toggles the expansion of its element in the `ExpandRowService` on click and sets the `expanded-row` class.',
  status: 'stable',
  imports: [{ name: 'MatTableModule', from: '@angular/material/table' }],
  host: {
    template: `
      <table mat-table multiTemplateDataRows [dataSource]="[{ name: 'Alice', mail: 'alice@example.com' }, { name: 'Bob', mail: 'bob@example.com' }]">
        <ng-container matColumnDef="expand">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let element" [rxap-expand-controls-cell]="element"></td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>
        <ng-container matColumnDef="detail">
          <td mat-cell *matCellDef="let element" [rxap-expand-row]="element" colspan="2">
            <ng-template rxapExpandRowContent let-row>
              <p>Mail: {{ row.mail }}</p>
            </ng-template>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['expand', 'name']"></tr>
        <tr mat-row *matRowDef="let element; columns: ['expand', 'name']" [rxapExpandRow]="element"></tr>
        <tr mat-row *matRowDef="let row; columns: ['detail']"></tr>
      </table>
    `,
  },
  variants: [
    { name: 'In a table', description: 'Click a row to expand it.' },
  ],
})
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
