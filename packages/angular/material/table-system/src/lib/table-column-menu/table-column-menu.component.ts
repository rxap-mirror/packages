import { NgClass } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
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
    host: {
      '[class.inline]': 'inline()',
      '[class.mat-card-mode]': 'matCard()',
    },
    imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    StopPropagationDirective,
    MatCheckboxModule,
    NgClass
]
})
export class TableColumnMenuComponent {

  public readonly columns = contentChildren(TableColumnOptionComponent);

  public readonly visibleColumns = computed(() => this.columns().filter((option) => !option.isHidden()));

  /**
   * The names of all currently active columns
   */
  public readonly displayColumns = computed<string[]>(() => this.columns()
                                                             .filter((option) => option.active())
                                                             .map((option) => option.name()));

  /**
   * true - the menu is displayed inline and not absolute
   */
  public readonly inline = input(false, { transform: coerceBoolean });

  public readonly matCard = input(false, { transform: coerceBoolean });

  public activate(columnName: string) {
    this.columns()
        .filter((option) => option.name() === columnName)
        .forEach((column) => column.activate());
  }

  public deactivate(columnName: string) {
    this.columns()
        .filter((option) => option.name() === columnName)
        .forEach((column) => column.deactivate());
  }
}
