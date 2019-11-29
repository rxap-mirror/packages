import { RxapElement } from './element';
import { DeleteUndefinedProperties } from '@rxap/utilities';
import * as uuid from 'uuid/v1';
import { RxapTableDefinition } from '../definition/table-definition';

export class Action {

  public static fromElement(element: RxapElement): Action {
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

  public httpMethod = 'GET';
  public propertyKey!: string;
  public id!: string;
  public type?: string;
  public icon!: string;
  public tooltip?: string;
  public color?: string;
  public url?: string;
  public refresh?: boolean;
  public routerLink?: string;
  public hide?: { propertyKey: string, value: any };
  public show?: { propertyKey: string, value: any };

  public toConfig() {
    const config: any = {
      type:        this.type,
      icon:        this.icon,
      tooltip:     this.tooltip,
      color:       this.color,
      url:         this.url,
      id:          this.id,
      propertyKey: this.propertyKey,
      httpMethod:  this.httpMethod,
      refresh:     this.refresh,
      routerLink:  this.routerLink
    };

    if (this.hide) {
      config.hide = (row: any) => row[ this.hide!.propertyKey ] === this.hide!.value;
    }

    if (this.show) {
      config.show = (row: any) => row[ this.show!.propertyKey ] === this.show!.value;
    }

    return DeleteUndefinedProperties(config);
  }

  public apply(tableDefinition: RxapTableDefinition<any>) {
    (tableDefinition as any)[ this.propertyKey ] = this.toConfig();
    tableDefinition.actionKeys.push(this.propertyKey);
  }

}
