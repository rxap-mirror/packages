import {
  ElementChild,
  ElementDef,
  ElementExtends, ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  AddNgModuleImport, NodeFactory,
  ToValueContext,
} from '@rxap/schematics-utilities';
import { OptionsElement } from '@rxap/xml-parser/elements';
import { ElementFactory } from '@rxap/xml-parser';
import { ColumnElement } from './column.element';
import { FilterElement } from './filters/filter.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('options-column')
export class OptionsColumnElement extends ColumnElement {

  @ElementChild(OptionsElement)
  public options!: OptionsElement;

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      'mat-header-cell',
      '*matHeaderCellDef',
      `i18n="${this.i18nTitle}"`
    ];

    if (this.__parent.hasFeature('sort')) {
      attributes.push('mat-sort-header');
    }

    if (!this.options.options) {
      throw new Error('The options-column has not any defined option');
    }

    return NodeFactory('th', ...attributes)('\n' + capitalize(this.name) + '\n') +
      NodeFactory('td', 'mat-cell', `[rxap-options-cell]="element${this.valueAccessor}"`, '*matCellDef="let element"')(
        this.options.options.map(option => NodeFactory('mat-option', typeof option.value === 'string' ? `value="${option.value}"` : `[value]="${option.value}"`)(option.display))
      );
  }

  public postParse() {
    if (this.filter) {
      this.filter = ElementFactory(FilterElement, {});
    }
  }


  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    // TODO : mv DateCellComponentModule to rxap
    AddNgModuleImport(sourceFile, 'OptionsCellComponentModule', '@rxap/material-table-system');
    AddNgModuleImport(sourceFile, 'MatSelectModule', '@angular/material/select');
  }


}
