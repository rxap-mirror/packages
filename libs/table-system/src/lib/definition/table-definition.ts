import {
  Injectable,
  InjectionToken
} from '@angular/core';
import { RxapColumn } from '@rxap/table-system';
import { RxapRowAction } from '../row-action';


export const RXAP_TABLE_SYSTEM_DEFINITION = new InjectionToken('rxap/table-system/definition');

export function BuildActionColumnTemplate(actions: RxapRowAction<any>[]): (row: any) => string {
  return (row: any) => {
    let template = '<div>';

    for (const action of actions) {
      if (action.hide && action.hide(row)) {
        continue;
      }
      if (action.show && !action.show(row)) {
        continue;
      }
      template += `<button class="${action.id} mat-icon-button mat-button-base" style="cursor: pointer">
  <span class="mat-button-wrapper">
    <mat-icon class="mat-icon notranslate material-icons mat-icon-no-color" role="img" aria-hidden="true">
    ${action.icon}
    </mat-icon>
  </span>
  <div class="mat-button-ripple mat-ripple mat-button-ripple-round"></div>
  <div class="mat-button-focus-overlay"></div>
</button>`;
    }

    return template + '</div>';
  }
}

@Injectable()
export class RxapTableDefinition<Data> {

  public get columns(): Partial<RxapColumn>[] {
    const columns      = this.columnsKeys.reduce((array: any[], key: string) => [ ...array, (this as any)[ key ] ], []);
    const actionColumn = this.actionColumn;
    if (actionColumn) {
      columns.unshift(actionColumn);
    }
    return columns;
  }

  public get actionColumn(): Partial<RxapColumn> | null {
    if (this.actionKeys.length) {
      return { id: '__actions', header: '', template: BuildActionColumnTemplate(this.actions) };
    }
    return null;
  }

  public get actions(): RxapRowAction<Data>[] {
    return this.actionKeys.reduce((array: any[], key: string) => [ ...array, (this as any)[ key ] ], []);
  }

  public columnsKeys: string[] = [];

  public actionKeys: string[] = [];

  public tableId!: string;

  public rxapOnInit() {}

}
