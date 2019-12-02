import { RxapElement } from './element';
import { Table } from './table';
import { Column } from './column';
import { Action } from './action';
import { Header } from './header';
import * as uuid from 'uuid/v1';

export class Parser {

  public static CreateTable(element: RxapElement): Table {
    const table = new Table();

    if (element.hasChild('columns')) {
      const columns = element.getChild('columns')!;
      table.columns = columns.getChildren('column').map(column => Parser.CreateColumn(column));
    }

    if (element.hasChild('actions')) {
      const actions = element.getChild('actions')!;
      table.actions = actions.getAllChildNodes().map(action => Parser.CreateAction(action));
    }

    Object.assign(table, element.getAttributeMap());

    return table;
  }

  public static CreateAction(element: RxapElement): Action {
    const action = new Action();

    action.type = element.getString('type');
    const icon  = element.getString('icon') || element.textContent;
    if (!icon) {
      throw new Error('Action icon is required');
    }
    action.icon        = icon;
    action.tooltip     = element.getString('tooltip');
    action.color       = element.getString('color');
    action.url         = element.getString('url');
    action.id          = element.getString('id') || uuid();
    action.propertyKey = element.getString('propertyKey') || action.id;
    action.httpMethod  = element.getString('httpMethod') || action.httpMethod;
    action.refresh     = element.getBoolean('refresh');
    action.routerLink  = element.getString('routerLink');

    if (element.hasChild('hide')) {
      const hide  = element.getChild('hide')!;
      action.hide = {
        propertyKey: hide.getString('key')!,
        value:       hide.getParsedContent()
      };
    }

    if (element.hasChild('show')) {
      const show  = element.getChild('show')!;
      action.show = {
        propertyKey: show.getString('key')!,
        value:       show.getParsedContent()
      };
    }

    return action;
  }

  public static CreateColumn(element: RxapElement): Column {
    const column = new Column();

    const adjust: string = element.getString('adjust') as any;
    if (adjust === 'true') {
      column.adjust = true;
    } else {
      column.adjust = adjust as any;
    }

    column.css = element.getString('css');
    if (element.hasChild('header')) {
      column.header = [ Header.fromElement(element.getChild('header')!) ];
    } else if (element.hasChild('headers')) {
      const headers = element.getChild('headers')!;
      column.header = headers.getChildren('header').map(e => Header.fromElement(e));
    }
    if (element.hasChild('footer')) {
      column.footer = [ Header.fromElement(element.getChild('footer')!) ];
    } else if (element.hasChild('footers')) {
      const footers = element.getChild('footers')!;
      column.footer = footers.getChildren('footer').map(e => Header.fromElement(e));
    }
    const id = element.getString('id');
    if (!id) {
      throw new Error('Column id is required');
    }
    column.id          = id;
    column.minWidth    = element.getNumber('minWidth');
    column.maxWidth    = element.getNumber('maxWidth');
    column.sort        = element.getString('sort') as any;
    column.width       = element.getNumber('width');
    column.propertyKey = element.getString('propertyKey') || column.id;

    return column;
  }

  public static CreateTableFromXml(xml: string): Table {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element);

    return Parser.CreateTable(root);
  }

}
