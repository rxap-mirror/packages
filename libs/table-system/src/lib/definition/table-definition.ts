import {
  Injectable,
  InjectionToken
} from '@angular/core';
import { RxapColumn } from '@rxap/table-system';
import { RxapRowAction } from '../row-action';
import { Subject } from 'rxjs';


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
  };
}

@Injectable()
export class RxapTableDefinition<Data> {
  public get menuColumns(): Array<{ id: string, header: string }> {
    return this
      .columns
      .map(column => {
        const header = column.header;

        if (!header) {
          return null;
        }

        let headerText: string;

        if (typeof header === 'string') {
          headerText = header;
        } else {
          const textheader = header.filter(Boolean).filter(h => typeof h === 'string' || (!!h.text && !h.content))[ 0 ];
          if (textheader) {
            if (typeof textheader === 'string') {
              headerText = textheader;
            } else {
              headerText = textheader.text;
            }
          } else {
            return null;
          }
        }

        return { id: column.id!, header: headerText };

      })
      .filter(Boolean) as any;
  }

  public get columns(): Partial<RxapColumn>[] {
    const columns      = this.__columnsKeys.reduce((array: any[], key: string) => [ ...array, (this as any)[ key ] ], []);
    const actionColumn = this.actionColumn;
    if (actionColumn) {
      columns.unshift(actionColumn);
    }
    return columns;
  }

  public get actionColumn(): Partial<RxapColumn> | null {
    if (this.__actionKeys.length) {
      return { id: '__actions', header: '', template: BuildActionColumnTemplate(this.actions) };
    }
    return null;
  }

  public hasAddRow: boolean = false;

  public get actions(): RxapRowAction<Data>[] {
    return this.__actionKeys.reduce((array: any[], key: string) => [ ...array, (this as any)[ key ] ], []);
  }

  public __config: any = {};

  public __title!: string;

  public __subTitle!: string;

  public __columnsKeys: string[] = [];

  public __actionKeys: string[] = [];

  public id!: string;

  public hideColumn$ = new Subject<string>();
  public showColumn$ = new Subject<string>();

  public rxapOnInit() {}

  public hideColumn(key: string): void {
    if (this.hasColumn(key)) {
      const column  = this.getColumn(key)!;
      column.hidden = true;
    }
  }

  public showColumn(key: string): void {
    if (this.hasColumn(key)) {
      const column  = this.getColumn(key)!;
      column.hidden = false;
    }
  }

  public toggleColumn(key: string): void {
    if (this.hasColumn(key)) {
      const column  = this.getColumn(key)!;
      column.hidden = !column.hidden;
      if (column.hidden) {
        this.hideColumn$.next(key);
      } else {
        this.showColumn$.next(key);
      }
    }
  }

  public hasColumn(key: string): boolean {
    return this.__columnsKeys.includes(key);
  }

  public getColumn(key: string): Partial<RxapColumn> | null {
    return this.columns.find(column => column.id === key) || null;
  }

  public isColumnHidden(id: string): boolean {
    if (this.hasColumn(id)) {
      return this.getColumn(id)!.hidden || false;
    }
    return false;
  }

  public addRow(): void {

  }

}
