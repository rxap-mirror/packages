import { DeleteUndefinedProperties } from '@rxap/utilities';
import { RxapTableDefinition } from '../definition/table-definition';

export class Action {

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
    tableDefinition.__actionKeys.push(this.propertyKey);
  }

}
