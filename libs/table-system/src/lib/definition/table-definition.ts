import {
  Injectable,
  InjectionToken
} from '@angular/core';
import { RxapColumn } from '@rxap/table-system';
import { RxapRowAction } from '../row-action';
import {
  HttpClient,
  HttpRequest
} from '@angular/common/http';
import { compile } from 'handlebars';
import {
  first,
  tap
} from 'rxjs/operators';


export const RXAP_TABLE_SYSTEM_DEFINITION = new InjectionToken('rxap/table-system/definition');

export function BuildActionColumnTemplate(actions: RxapRowAction<any>[]): string {
  let template = '<div>';

  for (const action of actions) {
    template += `<button class="${action.id} mat-icon-button mat-button-base">
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

  constructor(public http: HttpClient) {}

  public rxapOnInit() {}

  public rxapOnDestroy() {}

  public rxapOnAction(action: RxapRowAction<Data>, row: Data): void {
    if (action.url) {
      const urlTemplate = compile(action.url);
      const url         = urlTemplate({ row });
      this.http.request(new HttpRequest(action.httpMethod as any, url)).pipe(
        first(),
        tap(() => {
          if (action.refresh) {
            throw new Error('Not yet implemented');
          }
        })
      ).subscribe();
    }
  }


}
