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
import { Showcase } from '@ng-prism/core';

@Showcase<TableColumnMenuComponent>({
  title: 'Column Menu',
  category: 'Table System',
  description: 'Menu button to show and hide the columns of a table. The columns are defined with projected `rxap-table-column-option` elements.',
  status: 'stable',
  variants: [
    {
      name: 'Default',
      template: '<rxap-table-column-option name="name">Name</rxap-table-column-option><rxap-table-column-option name="email">E-Mail</rxap-table-column-option><rxap-table-column-option name="role">Role</rxap-table-column-option>',
    },
    {
      name: 'Inactive column',
      description: 'A column can be initial inactive or hidden from the menu.',
      template: '<rxap-table-column-option name="name">Name</rxap-table-column-option><rxap-table-column-option name="email" inactive>E-Mail</rxap-table-column-option><rxap-table-column-option name="internal" hidden>Internal</rxap-table-column-option>',
    },
    {
      name: 'Inline',
      inputs: { inline: true },
      template: '<rxap-table-column-option name="name">Name</rxap-table-column-option><rxap-table-column-option name="email">E-Mail</rxap-table-column-option>',
    },
    {
      name: 'Mat card',
      inputs: { matCard: true },
      template: '<rxap-table-column-option name="name">Name</rxap-table-column-option><rxap-table-column-option name="email">E-Mail</rxap-table-column-option>',
    },
    {
      name: 'With archived toggle',
      description: 'The show archived slide toggles the archived rows and the removed at columns.',
      template: '<rxap-table-column-option name="name">Name</rxap-table-column-option><rxap-table-column-option name="removedAt">Removed at</rxap-table-column-option><span mat-menu-item><rxap-table-show-archived-slide></rxap-table-show-archived-slide></span>',
    },
  ],
})
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
