import { NgClass } from '@angular/common';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  contentChildren
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { StopPropagationDirective } from '@rxap/directives';
import { coerceBoolean } from '@rxap/utilities';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';

@Component({
    selector: 'rxap-table-column-menu',
    templateUrl: './table-column-menu.component.html',
    styleUrls: ['./table-column-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'rxapTableColumns',
    imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    StopPropagationDirective,
    MatCheckboxModule,
    NgClass
]
})
export class TableColumnMenuComponent implements AfterContentInit {

  public get visibleColumns() {
    return this.columns()?.filter((option) => !option.hidden);
  }

  public readonly columns = contentChildren(TableColumnOptionComponent);

  public displayColumns: string[] = [];

  @HostBinding('class.inline')
  private _inline = false;

  public get inline(): boolean | '' {
    return this._inline;
  }

  /**
   * true - the menu is displayed inline and not absolute
   * @param value
   */
  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set inline(value: boolean | '') {
    this._inline = coerceBoolean(value);
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
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
    const columns = this.columns();
    if (!columns) {
      throw new Error(
        'Could not query content children of TableColumnOptionComponent',
      );
    }
    this.displayColumns = columns
                              .filter((option) => option.active())
                              .map((option) => option.name());
  }

  public activate(columnName: string) {
    this.columns()
        ?.filter((option) => option.name() === columnName)
        .forEach((column) => column.activate());
    this.updateDisplayColumns();
  }

  public deactivate(columnName: string) {
    this.columns()
        ?.filter((option) => option.name() === columnName)
        .forEach((column) => column.deactivate());
    this.updateDisplayColumns();
  }
}
