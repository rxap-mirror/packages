import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';
import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SelectRowModule} from './select-row.module';
import {SelectRowService} from './select-row.service';

@Component({
  styles: [
    `

        .mat-column-name {
            padding-left: 16px;
        }

    `,
  ],
  template: `

      <table mat-table [dataSource]="data" #matTable="matTable">

          <ng-container matColumnDef="select">
              <th mat-header-cell rxap-checkbox-header-cell *matHeaderCellDef></th>
              <td *matCellDef="let element" [element]="element" mat-cell rxap-checkbox-cell></td>
          </ng-container>

          <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Name</th>
              <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['select', 'name']"></tr>
          <tr mat-row *matRowDef="let element; columns: ['select', 'name'];"></tr>

      </table>

      <hr>

      <div>Selected rows: <span *rxapSelectedRows="let rows">{{rows | json}}</span></div>

  `,
})
class DemoTableComponent {

  public data = [
    {name: 'Name1'},
    {name: 'Name2'},
    {name: 'Name3'},
    {name: 'Name4'},
    {name: 'Name5'},
    {name: 'Name6'},
    {name: 'Name7'},
  ];

  constructor(public readonly selectRow: SelectRowService<any>) {
  }

}

addDecorator(moduleMetadata({
  imports: [
    SelectRowModule,
    MatTableModule,
    CommonModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    DemoTableComponent,
  ],
}));

export default {
  title: 'SelectTable',
  component: DemoTableComponent,
};

export const basic = () => ({
  component: DemoTableComponent,
  props: {},
});
