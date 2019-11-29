import { RxapTableDefinition } from './definition/table-definition';

export enum HttpMethods {
  GET    = 'GET',
  POST   = 'POST',
  PUT    = 'PUT',
  DELETE = 'DELETE',
}

export interface RxapRowAction<Data, T extends RxapTableDefinition<Data> = RxapTableDefinition<Data>> {

  id: string;
  type?: string;
  icon: string;
  tooltip?: string;
  color?: string;
  url?: string;
  handel?: (this: T, row: Data) => Promise<any>;
  httpMethod: HttpMethods;
  refresh?: boolean;
  routerLink?: string;
  hide?: (row: Data) => boolean,
  show?: (row: Data) => boolean,

}
