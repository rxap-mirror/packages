import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ColumnElement } from './column.element';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('boolean-column')
export class BooleanColumnElement extends ColumnElement {

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}
    i18n="${this.i18nTitle}">
    ${capitalize(this.name)}
    </th>
    <td mat-cell
    [rxap-boolean-cell]="element${this.valueAccessor}"
    *matCellDef="let element"></td>
    `;
  }

  public templateFilter(): string {
    return `<th mat-header-cell *matHeaderCellDef><mat-checkbox indeterminate parentControlContainer
i18n="${this.i18nLabel}"
formControlName="${camelize(this.name)}">
${capitalize(this.name)}
</mat-checkbox></th>`;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.filter) {
      AddNgModuleImport(sourceFile, 'MatCheckboxModule', '@angular/material/checkbox');
    }
    // TODO : mv BooleanCellComponentModule to rxap
    AddNgModuleImport(sourceFile, 'BooleanCellComponentModule', '@rxap/material-table-system');
  }

}
