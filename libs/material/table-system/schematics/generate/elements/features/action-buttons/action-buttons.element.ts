import {
  DisplayColumn,
  FeatureElement
} from '../feature.element';
import {
  ElementChildren,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { SourceFile } from 'ts-morph';
import { ToValueContext } from '@rxap-schematics/utilities';
import {
  Rule,
  chain
} from '@angular-devkit/schematics';

@ElementExtends(FeatureElement)
@ElementDef('actions')
export class ActionButtonsElement extends FeatureElement {

  @ElementChildren(ActionButtonElement)
  public actions?: ActionButtonElement[];

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponentModule({ sourceFile, project, options }));
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponent({ sourceFile, project, options }));
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return {
      name: 'controls',
      hidden: true
    };
  }

  public columnTemplateFilter(): string {
    return `
    <ng-container matColumnDef="filter_controls" sticky>
      <th mat-header-cell *matHeaderCellDef></th>
    </ng-container>
    `;
  }

  public columnTemplate(): string {
    return `
    <ng-container matColumnDef="controls" sticky>
      <th mat-header-cell mfd-row-controls-header-cell *matHeaderCellDef></th>
      <td mat-cell mfd-row-controls-cell [element]="element" *matCellDef="let element"></td>
    </ng-container>
    `;
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.actions?.map(action => action.toValue({ project, options })) ?? []);
  }

}
