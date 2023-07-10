import type { QueryList } from '@angular/core';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  HostBinding,
  Input,
} from '@angular/core';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';
import { coerceBoolean } from '@rxap/utilities';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { StopPropagationDirective } from '@rxap/directives';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rxap-table-column-menu',
  templateUrl: './table-column-menu.component.html',
  styleUrls: [ './table-column-menu.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'rxapTableColumns',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgFor,
    StopPropagationDirective,
    ExtendedModule,
    MatCheckboxModule,
  ],
})
export class TableColumnMenuComponent implements AfterContentInit {
  @ContentChildren(TableColumnOptionComponent)
  public columns?: QueryList<TableColumnOptionComponent>;

  public displayColumns: string[] = [];

  @Input()
  public set matCard(value: boolean | '') {
    this._matCardMode = coerceBoolean(value);
  }

  @HostBinding('class.mat-card-mode')
  private _matCardMode = false;

  public ngAfterContentInit() {
    this.updateDisplayColumns();
  }

  public updateDisplayColumns() {
    if (!this.columns) {
      throw new Error(
        'Could not query content children of TableColumnOptionComponent',
      );
    }
    this.displayColumns = this.columns
      .filter((option) => option.active)
      .map((option) => option.name);
  }

  public activate(columnName: string) {
    this.columns
      ?.filter((option) => option.name === columnName)
      .forEach((column) => column.activate());
    this.updateDisplayColumns();
  }

  public deactivate(columnName: string) {
    this.columns
      ?.filter((option) => option.name === columnName)
      .forEach((column) => column.deactivate());
    this.updateDisplayColumns();
  }
}
