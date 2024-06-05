import { AngularOptions } from '../../../../lib/angular-options';
import { OpenApiTableAction } from '../../../../lib/table/action/open-api-table-action';


export interface OpenApiTableActionOptions  extends OpenApiTableAction, AngularOptions {
  tableName: string;
}
