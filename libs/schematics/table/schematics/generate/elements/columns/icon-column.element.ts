import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { ColumnElement } from './column.element';
import { NodeFactory } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('icon-column')
export class IconColumnElement extends ColumnElement {
  public template(): string {
    const thAttributes: string[] = ['mat-header-cell', '*matHeaderCellDef'];

    if (this.__parent.hasFeature('sort')) {
      thAttributes.push('mat-sort-header');
    }

    const tdAttributes: string[] = [
      'mat-cell',
      '*matCellDef="let element"',
      `[rxap-icon-cell]="element${this.valueAccessor}"`,
    ];

    return [
      NodeFactory(
        'th',
        ...thAttributes
      )(`<ng-container i18n>${capitalize(this.name)}</ng-container>`),
      NodeFactory('td', ...tdAttributes)(),
    ].join('\n');
  }

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(
      sourceFile,
      'IconCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
