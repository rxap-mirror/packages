import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-utilities';
import { ColumnElement } from './column.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('copy-to-clipboard-column')
export class CopyToClipboardColumnElement extends ColumnElement {

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}
    i18n="${this.i18nTitle}">
    ${capitalize(this.name)}
    </th>
    <td mat-cell
    [rxap-copy-to-clipboard-cell]="element${this.valueAccessor}"
    *matCellDef="let element"></td>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(sourceFile, 'CopyToClipboardCellComponentModule', '@rxap/material-table-system');
  }


}
