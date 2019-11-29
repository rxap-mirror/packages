import { RxapElement } from './element';
import { DeleteUndefinedProperties } from '@rxap/utilities';
import * as uuid from 'uuid/v1';
import { RxapTableDefinition } from '../definition/table-definition';

export class Action {

  public static fromElement(element: RxapElement): Action {
    const action = new Action();

    action.type = element.getString('type');
    const icon  = element.getString('icon');
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

  public toConfig() {
    return DeleteUndefinedProperties({
      type:        this.type,
      icon:        this.icon,
      tooltip:     this.tooltip,
      color:       this.color,
      url:         this.url,
      id:          this.id,
      propertyKey: this.propertyKey,
      httpMethod:  this.httpMethod,
      refresh:     this.refresh
    });
  }

  public apply(tableDefinition: RxapTableDefinition<any>) {
    (tableDefinition as any)[ this.propertyKey ] = this.toConfig();
    tableDefinition.actionKeys.push(this.propertyKey);
  }

}
