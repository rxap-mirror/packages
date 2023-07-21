import { FormControlOptions } from '../../form-control/schema';
import { TableColumn } from '../../../table/table-component/schema';

export interface TableSelectFormControlOptions extends FormControlOptions {
  multiple?: boolean;
  columnList: Array<TableColumn | string>;
}
