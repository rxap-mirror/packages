import { Method } from '@rxap/pattern';
import {
  getMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';

export const RXAP_TABLE_HEADER_BUTTON_METHOD_METADATA = 'rxap-table-header-button-method-metadata';

export interface TableHeaderButtonMethodOptions {
  /**
   * If true, the table will be refreshed after the action is executed.
   */
  refresh?: boolean;
  /**
   * If true, the user will be asked to confirm the action before execution.
   */
  confirm?: boolean;
  /**
   * The tooltip of the action button.
   */
  tooltip?: string;

  /**
   * The error message that will be displayed if the action fails.
   */
  errorMessage?: string;

  /**
   * The success message that will be displayed if the action succeeds.
   */
  successMessage?: string;

}

export function TableHeaderButtonMethod(
  options: TableHeaderButtonMethodOptions = {},
): ClassDecorator {
  return function (target: any) {
    setMetadata(RXAP_TABLE_HEADER_BUTTON_METHOD_METADATA, options, target);
  };
}

export function GetTableHeaderButtonMetadata(method: Method): TableHeaderButtonMethodOptions {
  const metadata = getMetadata<TableHeaderButtonMethodOptions>(
    RXAP_TABLE_HEADER_BUTTON_METHOD_METADATA,
    method.constructor,
  );
  if (!metadata) {
    throw new Error(`Extracted metadata from '${ method.constructor.name }' is empty`);
  }
  return metadata;
}
