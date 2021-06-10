import {
  ElementAttribute,
  ElementDef,
  ElementExtends,
} from '@rxap/xml-parser/decorators';
import {
  chain,
  externalSchematic,
  Rule,
  noop,
} from '@angular-devkit/schematics';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { SourceFile } from 'ts-morph';
import { ColumnElement } from './column.element';
import { GenerateSchema } from '../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('component-column')
export class ComponentColumnElement extends ColumnElement {
  @ElementAttribute()
  public withElement: boolean = false;

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(
      sourceFile,
      `${classify(this.name)}CellComponentModule`,
      `./${dasherize(this.name)}-cell/${dasherize(
        this.name
      )}-cell.component.module`
    );
  }

  public template(): string {
    return `
    <th mat-header-cell
    *matHeaderCellDef
    ${this.__parent.hasFeature('sort') ? 'mat-sort-header' : ''}>
    <ng-container i18n>${capitalize(this.name)}</ng-container>
    </th>
    <td mat-cell
    [rxap-${dasherize(this.name)}-cell]="element${this.valueAccessor}"
    ${this.withElement ? '[element]="element"' : ''}
    *matCellDef="let element"></td>
    `;
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const rules: Rule[] = [super.toValue({ project, options })];

    rules.push((tree) => {
      const path = options.path?.replace(/^\//, '') ?? '';
      if (
        !tree.exists(
          join(
            path,
            dasherize(this.name) + '-cell',
            dasherize(this.name) + '-cell.component.module.ts'
          )
        )
      ) {
        return externalSchematic('@rxap/schematics', 'component-module', {
          name: dasherize(this.name) + '-cell',
          project: options.project,
          path: options.path?.replace(/^\//, ''),
          prefix: 'rxap',
          selector: `td[rxap-${dasherize(this.name)}-cell]`,
        });
      } else {
        return noop();
      }
    });

    return chain(rules);
  }
}
