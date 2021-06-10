import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { FilterElement } from './filters/filter.element';
import { ParsedElement, ElementFactory } from '@rxap/xml-parser';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';
import { ControlElement } from '@rxap/schematics-form/schematics/generate/elements/control.element';
import {
  HandleComponent,
  HandleComponentModule,
  AddNgModuleImport,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { GenerateSchema } from '../../schema';
import { DisplayColumn } from '../features/feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('column')
export class ColumnElement
  implements ParsedElement<Rule>, HandleComponentModule, HandleComponent
{
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

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return {
      name: this.name,
      hidden: this.hidden,
      active: this.active,
    };
  }

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}>
    <ng-container i18n>${capitalize(this.name)}</ng-container>
    </th>
    <td mat-cell *matCellDef="let element">{{ element${
      this.valueAccessor
    } }}</td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef>
      <mat-form-field rxapNoPadding>
        <mat-label i18n>${capitalize(this.name)}</mat-label>
        <input matInput i18n-placeholder
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

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.filter) {
      AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
      AddNgModuleImport(
        sourceFile,
        'MatInputModule',
        '@angular/material/input'
      );
      AddNgModuleImport(
        sourceFile,
        'MatButtonModule',
        '@angular/material/button'
      );
      AddNgModuleImport(
        sourceFile,
        'InputClearButtonDirectiveModule',
        '@rxap/material-form-system'
      );
      AddNgModuleImport(
        sourceFile,
        'FormFieldNoPaddingModule',
        '@rxap/material-directives/form-field'
      );
    }
  }

  public handleComponent({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {}

  public createControlElement(): ControlElement {
    if (!this.filter) {
      throw new Error(`The column ${this._name} has not a filter definition.`);
    }
    return ElementFactory(ControlElement, {
      id: dasherize(this.name),
      __tag: 'control',
    });
  }
}
