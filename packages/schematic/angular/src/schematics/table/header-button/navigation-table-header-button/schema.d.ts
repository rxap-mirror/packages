import { TableHeaderButtonOptions } from '../../table-header-button/schema';


export interface NavigationOptions {
  route: string;
}

export type NavigationTableHeaderButtonOptions = TableHeaderButtonOptions<NavigationOptions>;
