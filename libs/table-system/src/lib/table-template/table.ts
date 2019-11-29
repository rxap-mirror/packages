import { RxapElement } from './element';
import { Column } from './column';
import { Action } from './action';
import { RxapTableDefinition } from '../definition/table-definition';

export class Table {

  public static formXML(xml: string): Table {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element);

    return Table.formElement(root);
  }

  public static formElement(element: RxapElement): Table {
    const table = new Table();

    if (element.hasChild('columns')) {
      const columns = element.getChild('columns')!;
      table.columns = columns.getChildren('column').map(column => Column.fromElement(column));
    }

    if (element.hasChild('actions')) {
      const actions = element.getChild('actions')!;
      table.actions = actions.getChildren('action').map(action => Action.fromElement(action));
    }

    return table;
  }

  public columns: Column[] = [];
  public actions: Action[] = [];

  public apply(tableDefinition: RxapTableDefinition<any>): void {

    this.columns.forEach(column => column.apply(tableDefinition));
    this.actions.forEach(action => action.apply(tableDefinition));

  }

}
