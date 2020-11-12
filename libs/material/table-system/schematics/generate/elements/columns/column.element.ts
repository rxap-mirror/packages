import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { FilterElement } from './filters/filter.element';
import {
  ParsedElement,
  ElementFactory
} from '@rxap/xml-parser';
import { OptionsElement } from '@rxap/xml-parser/elements';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';
import { ControlElement } from '@rxap/forms/schematics/generate/elements/control.element';
import {
  HandleComponent,
  HandleComponentModule,
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';
import { Rule } from '@angular-devkit/schematics';
import { GenerateSchema } from '../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('column')
export class ColumnElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __tag!: string;
  public __parent!: TableElement;

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementChild(FilterElement)
  public filter?: FilterElement;

  @ElementChild(OptionsElement)
  public options?: OptionsElement;

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}
    i18n="@@table.${dasherize(this.__parent.id)}.column.${dasherize(this.name)}.title">
    ${capitalize(this.name)}
    </th>
    <td mat-cell *matCellDef="let element">{{ element['${this.name}'] }}</td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef>
      <mat-form-field>
        <mat-label i18n="@@table.${dasherize(this.__parent.id)}.column.${dasherize(this.name)}.filter.label">${capitalize(this.name)}</mat-label>
        <input matInput i18n-placeholder="@@table.${dasherize(this.__parent.id)}.column.${dasherize(this.name)}.filter.placeholder"
               placeholder="Enter the ${capitalize(this.name)} filter"
               parentControlContainer formControlName="${camelize(this.name)}">
        <button matSuffix rxapInputClearButton mat-icon-button>
          <mat-icon>clear</mat-icon>
        </button>
      </mat-form-field>
    </th>
    `;
  }

  public templateNoFiler(): string {
    return '<th mat-header-cell *matHeaderCellDef></th>';
  }

  public validate(): boolean {
    return true;
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return () => {};
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {

    if (this.filter) {
      AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
      AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
      AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
      AddNgModuleImport(sourceFile, 'InputClearButtonDirectiveModule', '@rxap-material/form-system');
    }

  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public createControlElement(): ControlElement {
    if (!this.filter) {
      throw new Error(`The column ${this.name} has not a filter definition.`);
    }
    return ElementFactory(ControlElement, { id: dasherize(this.name), __tag: 'control' });
  }

}
