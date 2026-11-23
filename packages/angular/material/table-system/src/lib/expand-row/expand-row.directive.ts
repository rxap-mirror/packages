import { computed, Directive, input, inject } from '@angular/core';
import { ExpandRowService } from './expand-row.service';
import { Showcase } from '@ng-prism/core';

@Showcase<ExpandRowDirective<any>>({
  title: 'Expand Row',
  category: 'Table System',
  description: 'Table row that toggles the expansion of its element in the `ExpandRowService` on click and sets the `expanded-row` class.',
  status: 'stable',
  imports: [{ name: 'MatTableModule', from: '@angular/material/table' }],
  host: {
    template: `
      <table mat-table multiTemplateDataRows [dataSource]="[{ name: 'Alice', mail: 'alice@example.com' }, { name: 'Bob', mail: 'bob@example.com' }]">
        <ng-container matColumnDef="expand">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let element" rxap-expand-controls-cell [element]="element"></td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>
        <ng-container matColumnDef="detail">
          <td mat-cell *matCellDef="let element" rxap-expand-row [element]="element" colspan="2">
            <ng-template rxapExpandRowContent let-row>
              <p>Mail: {{ row.mail }}</p>
            </ng-template>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['expand', 'name']"></tr>
        <tr mat-row *matRowDef="let element; columns: ['expand', 'name']" rxapExpandRow [element]="element"></tr>
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
    '[class.expanded-row]': 'isExpanded()',
    '(click)': 'onClick()',
  },
})
export class ExpandRowDirective<Data extends Record<string, any>> {
  private readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);

  public readonly element = input.required<Data>();

  public readonly isExpanded = computed(() => this.expandCell.isExpanded(this.element()));

  public onClick() {
    this.expandCell.toggleRow(this.element());
  }

}
