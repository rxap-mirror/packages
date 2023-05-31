import type { QueryList } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  ContentChildren,
  AfterContentInit,
  Input,
  HostBinding
} from '@angular/core';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';
import { coerceBoolean } from '@rxap/utilities';
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { StopPropagationDirective } from '@rxap/directives';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:        'rxap-table-column-menu',
  templateUrl:     './table-column-menu.component.html',
  styleUrls:       [ './table-column-menu.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-table-column-menu' },
  exportAs:        'rxapTableColumns',
  standalone:      true,
  imports:         [
    MatLegacyButtonModule,
    MatLegacyMenuModule,
    MatIconModule,
    NgFor,
    StopPropagationDirective,
    ExtendedModule,
    MatLegacyCheckboxModule
  ]
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
  private _matCardMode: boolean = false;

  public ngAfterContentInit() {
    this.updateDisplayColumns();
  }

  public updateDisplayColumns() {
    if (!this.columns) {
      throw new Error(
        'Could not query content children of TableColumnOptionComponent'
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
