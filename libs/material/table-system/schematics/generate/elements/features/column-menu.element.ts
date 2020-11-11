import {
  ElementAttribute,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  DisplayColumn,
  FeatureElement
} from './feature.element';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';
import { strings } from '@angular-devkit/core';
import { coerceArray } from '@rxap/utilities';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FeatureElement)
@ElementDef('column-menu')
export class ColumnMenuElement extends FeatureElement {

  public __parent!: TableElement;

  @ElementAttribute()
  public showArchived?: boolean;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    // TODO : mv TableColumnMenuComponentModule to rxap
    AddNgModuleImport(sourceFile, 'TableColumnMenuComponentModule', '@mfd/shared/table-column-menu/table-column-menu.component.module');
    if (this.showArchived) {
      AddNgModuleImport(sourceFile, 'DateCellComponentModule', '@mfd/shared/date-cell/date-cell.component.module');
      AddNgModuleImport(sourceFile, 'MatDividerModule', '@angular/material/divider');
      AddNgModuleImport(
        sourceFile,
        'TableShowArchivedSlideComponentModule',
        '@mfd/shared/table-show-archived-slide/table-show-archived-slide.component.module'
      );
    }
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name: 'removedAt',
      active: false,
      hidden: true
    };
  }

  public columnTemplateFilter(): string {
    if (this.showArchived) {
      return FeatureElement.ColumnNoFilter('removedAt');
    }
    return super.columnTemplateFilter();
  }

  public columnTemplate(): string {
    if (this.showArchived) {
      return `
      <ng-container matColumnDef="removedAt">
        <th mat-header-cell *matHeaderCellDef> Removed At </th>
        <td mat-cell [rxap-date-cell]="element.__removedAt" *matCellDef="let element"></td>
      </ng-container>
      `;
    }
    return super.columnTemplate();
  }

  public headerTemplate(): string {
    let template = '<rxap-table-column-menu matCard #rxapTableColumns="rxapTableColumns">';

    for (const feature of this.__parent.features) {
      const displayColumns = coerceArray(feature.displayColumn());
      for (const displayColumn of displayColumns) {
        template += `
        <rxap-table-column-option
        ${displayColumn.hidden ? 'hidden' : ''}
        ${displayColumn.active === false ? 'inactive' : ''}
        name="${displayColumn.name}">
        </rxap-table-column-option>
        `;
      }
    }

    for (const column of this.__parent.columns) {
      template += `
      <rxap-table-column-option name="${column.name}"
                                i18n="@@table.${dasherize(this.__parent.id)}.column.${dasherize(column.name)}.title">
        ${capitalize(column.name)}
      </rxap-table-column-option>
      `;
    }

    if (this.showArchived) {
      template += `
      <mat-divider></mat-divider>
      <span mat-menu-item>
        <mfd-table-show-archived-slide></mfd-table-show-archived-slide>
      </span>
      `;
    }
    template += '</rxap-table-column-menu>';
    return template;
  }

}
