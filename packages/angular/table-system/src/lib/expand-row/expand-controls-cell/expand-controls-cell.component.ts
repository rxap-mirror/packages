import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { ExpandRowService } from '../expand-row.service';
import { MatIconModule } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { Showcase } from '@ng-prism/core';

@Showcase<ExpandControlsCellComponent<any>>({
  title: 'Expand Controls Cell (Basic)',
  category: 'Table System (Basic)',
  description: 'Table cell with a button that shows whether the row is expanded. The click is handled by the `rxapExpandRow` directive of the row.',
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
    { name: 'In a table', description: 'Click a row to toggle the expand icon.' },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-expand-controls-cell]',
    templateUrl: './expand-controls-cell.component.html',
    styleUrls: ['./expand-controls-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule]
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {
  readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  public readonly element = input.required<Data>({ alias: "rxap-expand-controls-cell" });

  public readonly expanded = toSignal(
    toObservable(this.element).pipe(switchMap(element => this.expandCell.isExpanded$(element))),
    { initialValue: false },
  );

}
