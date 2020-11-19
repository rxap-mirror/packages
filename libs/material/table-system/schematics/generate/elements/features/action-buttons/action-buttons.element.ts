import { FeatureElement } from '../feature.element';
import {
  ElementChildren,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { SourceFile } from 'ts-morph';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import {
  Rule,
  chain
} from '@angular-devkit/schematics';
import { TableElement } from '../../table.element';
import { ElementFactory } from '@rxap/xml-parser';
import { ColumnElement } from '../../columns/column.element';

export class ControlsColumnElement extends ColumnElement {

  public __tag = 'controls-column';

  protected _name = 'controls';
  public sticky   = true;
  public hidden   = true;

  public template(): string {
    return `
    <th mat-header-cell mfd-row-controls-header-cell *matHeaderCellDef></th>
    <td mat-cell mfd-row-controls-cell [element]="element" *matCellDef="let element"></td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef></th>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    // TODO : mv TableRowControlsModule to rxap
    AddNgModuleImport(sourceFile, 'TableRowControlsModule', '@mfd/shared/table-row-controls/table-row-controls.module');
  }

}

@ElementExtends(FeatureElement)
@ElementDef('actions')
export class ActionButtonsElement extends FeatureElement {

  public __parent!: TableElement;

  @ElementChildren(ActionButtonElement)
  public actions?: ActionButtonElement[];

  public postParse() {
    this.__parent.columns.unshift(ElementFactory(ControlsColumnElement, {}));
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponentModule({ sourceFile, project, options }));
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponent({ sourceFile, project, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.actions?.map(action => action.toValue({ project, options })) ?? []);
  }

}
