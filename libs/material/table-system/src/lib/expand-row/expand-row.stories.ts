import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';
import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExpandRowService } from './expand-row.service';
import { ExpandRowModule } from './expand-row.module';

@Component({
  styles:   [
      `

      table {
        width: 100%;
      }

      tr.detail-row {
        height: 0;
      }

      tr.element-row:not(.expanded-row):hover {
        background: whitesmoke;
      }

      tr.element-row:not(.expanded-row):active {
        background: #efefef;
      }

      .element-row {
        cursor: pointer;
      }

      .element-row td {
        border-bottom-width: 0;
      }

      `
  ],
  template: `

              <table mat-table [dataSource]="data" multiTemplateDataRows>

                <ng-container matColumnDef="expandControls">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td *matCellDef="let element" [element]="element" mat-cell rxap-expand-controls-cell></td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef> Name</th>
                  <td mat-cell *matCellDef="let element">{{ element.name }}</td>
                </ng-container>

                <ng-container matColumnDef="expandedDetail">
                  <td mat-cell
                      rxap-expand-row
                      [element]="element"
                      *matCellDef="let element"
                      [attr.colspan]="2">
                    <ng-template rxapExpandRowContent>
                      <pre>{{ element | json }}</pre>
                    </ng-template>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['expandControls', 'name']"></tr>
                <tr mat-row
                    *matRowDef="let element; columns: ['expandControls', 'name'];"
                    [element]="element"
                    rxapExpandRow
                    class="element-row"></tr>
                <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="detail-row"></tr>

              </table>

            `
})
class DemoTable {

  public data = [
    { name: 'Name1' },
    { name: 'Name2' },
    { name: 'Name3' },
    { name: 'Name4' },
    { name: 'Name5' },
    { name: 'Name6' },
    { name: 'Name7' }
  ];

  constructor(public readonly expandCell: ExpandRowService<any>) {}

}

addDecorator(moduleMetadata({
  imports:      [
    ExpandRowModule,
    MatTableModule,
    CommonModule,
    BrowserAnimationsModule
  ],
  declarations: [
    DemoTable
  ]
}));

export default {
  title:     'ExpandTable',
  component: DemoTable
};

export const basic = () => ({
  component: DemoTable,
  props:     {}
});
