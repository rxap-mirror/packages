import {
  Directive,
  Input,
  ContentChild,
} from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Required } from '@rxap/utilities';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapDataGridRowDef]',
})
export class DataGridRowDefDirective {

  public get readonly(): boolean | '' {
    return this._readonly;
  }

  @Input()
  public set readonly(value: boolean | '') {
    this._readonly = coerceBooleanProperty(value);
  }

  @Input()
  public set controlPath(value: string) {
    this.controlPaths = [ value ];
  }

  @Input() public formId: string | null             = null;
  @Input() public submitRemoteMethod: string | null = null;
  @Input() public data: any | null                  = null;
  private _readonly: boolean                        = false;

  private _controlPaths?: string[];

  public get controlPaths(): string[] {
    return this._controlPaths || [ this.name ];
  }

  @Input()
  public set controlPaths(value: string[]) {
    this._controlPaths = value;
  }

  @Input('rxapDataGridRowDef')
  @Required
  public name!: string;

  @ContentChild(DataGridCellDefDirective)
  public cell?: DataGridCellDefDirective;

  @ContentChild(DataGridHeaderCellDefDirective)
  @Required
  public headerCell!: DataGridHeaderCellDefDirective;

}
