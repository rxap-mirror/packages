import { TableActionOptions } from '../../table-action/schema';


export interface OpenApiTableActionOptions extends TableActionOptions {
  operationId: string;
  body?: boolean | Record<string, string>;
  parameters?: boolean | Record<string, string>;
  scope?: string;
}
