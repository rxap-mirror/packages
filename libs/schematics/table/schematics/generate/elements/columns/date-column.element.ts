import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ColumnElement } from './column.element';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-utilities';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('date-column')
export class DateColumnElement extends ColumnElement {

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}
    i18n="${this.i18nTitle}">
    ${capitalize(this.name)}
    </th>
    <td mat-cell
    [rxap-date-cell]="element${this.valueAccessor}"
    format="dd.MM.yyyy HH:mm:ss"
    *matCellDef="let element"></td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef>
      <mat-form-field rxapNoPadding>
        <mat-label i18n="${this.i18nLabel}">${capitalize(this.name)}</mat-label>
        <input matInput [matDatepicker]="picker" parentControlContainer formControlName="${camelize(this.name)}">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </th>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });

    if (this.filter) {
      AddNgModuleImport(sourceFile, 'MatDatepickerModule', '@angular/material/datepicker');
      AddNgModuleImport(sourceFile, 'FormFieldNoPaddingModule', '@rxap/material-directives/form-field');
    }
    AddNgModuleImport(sourceFile, 'DateCellComponentModule', '@rxap/material-table-system');
  }


}
