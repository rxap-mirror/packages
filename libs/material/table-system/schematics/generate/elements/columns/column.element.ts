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
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';
import { ControlElement } from '@rxap/forms/schematics/generate/elements/control.element';
import {
  HandleComponent,
  HandleComponentModule,
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-utilities';
import { Rule } from '@angular-devkit/schematics';
import { GenerateSchema } from '../../schema';
import { DisplayColumn } from '../features/feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('column')
export class ColumnElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __tag!: string;
  public __parent!: TableElement;

  @ElementAttribute()
  @ElementRequired()
  public set name(value: string) {
    this._name = value;
  }

  public get name(): string {
    return this._name?.replace(/\./g, '-') ?? '';
  }

  @ElementAttribute()
  public hidden?: boolean;

  @ElementAttribute()
  public active?: boolean;

  @ElementAttribute()
  public sticky?: boolean;

  @ElementChild(FilterElement)
  public filter?: FilterElement;

  protected _name?: string;

  public get valueAccessor(): string {
    return this._name ? '?.' + this._name.split('.').join('?.') : '';
  }

  public get i18n(): string {
    return `@@table.${dasherize(this.__parent.id)}.column.${dasherize(this.name)}.`;
  }

  public get i18nTitle(): string {
    return this.i18n + 'title';
  }

  public get i18nLabel(): string {
    return this.i18n + 'label';
  }

  public get i18nPlaceholder(): string {
    return this.i18n + 'placeholder';
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return {
      name:   this.name,
      hidden: this.hidden,
      active: this.active
    };
  }

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}
    i18n="${this.i18nTitle}">
    ${capitalize(this.name)}
    </th>
    <td mat-cell *matCellDef="let element">{{ element${this.valueAccessor} }}</td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef>
      <mat-form-field rxapNoPadding>
        <mat-label i18n="${this.i18nLabel}">${capitalize(this.name)}</mat-label>
        <input matInput i18n-placeholder="${this.i18nPlaceholder}"
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
      AddNgModuleImport(sourceFile, 'InputClearButtonDirectiveModule', '@rxap/material-form-system');
      AddNgModuleImport(sourceFile, 'FormFieldNoPaddingModule', '@rxap/directives/form-field-no-padding');
    }

  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public createControlElement(): ControlElement {
    if (!this.filter) {
      throw new Error(`The column ${this._name} has not a filter definition.`);
    }
    return ElementFactory(ControlElement, { id: dasherize(this.name), __tag: 'control' });
  }

}
