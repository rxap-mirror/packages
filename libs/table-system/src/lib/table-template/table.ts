import { Column } from './column';
import { Action } from './action';
import { RxapTableDefinition } from '../definition/table-definition';
import { clone } from 'ramda';

export class Table {

  public columns: Column[] = [];
  public actions: Action[] = [];

  public apply(tableDefinition: RxapTableDefinition<any>): void {

    this.columns.forEach(column => column.apply(tableDefinition));
    this.actions.forEach(action => action.apply(tableDefinition));

    const config = clone(this);

    delete config.columns;
    delete config.actions;

    tableDefinition.__config = config;

  }

}
