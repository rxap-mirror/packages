import { Column } from './column';
import { Action } from './action';
import { RxapTableDefinition } from '../definition/table-definition';

export class Table {

  public columns: Column[] = [];
  public actions: Action[] = [];

  public apply(tableDefinition: RxapTableDefinition<any>): void {

    this.columns.forEach(column => column.apply(tableDefinition));
    this.actions.forEach(action => action.apply(tableDefinition));

    const config =

            Object.assign(tableDefinition);

  }

}
