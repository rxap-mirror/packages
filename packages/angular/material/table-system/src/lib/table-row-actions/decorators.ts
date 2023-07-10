import { setMetadata } from '@rxap/reflect-metadata';
import { RowActionCheckFunction } from './types';

/**
 * @deprecated use RXAP_TABLE_ACTION_METHOD_METADATA instead
 */
export const RXAP_TABLE_ACTION_METHOD_TYPE_METADATA = 'rxap-table-action-method-type-metadata';
export const RXAP_TABLE_ACTION_METHOD_METADATA = 'rxap-table-action-method-metadata';

/**
 * @deprecated use RXAP_TABLE_ACTION_METHOD_METADATA instead
 */
export const RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA = 'rxap-table-action-method-check-function-metadata';

export interface TableActionMethodOptions<Data extends Record<string, unknown> = Record<string, unknown>> {
  type?: string;
  checkFunction?: RowActionCheckFunction<Data>;
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

  /**
   * The priority of the action. If multiple action with the same type exists.
   * The action with the highest priority will be used. To set the defaults for
   * the directive.
   */
  priority?: number;
}

export function TableActionMethod<Data extends Record<string, unknown> = Record<string, unknown>>(options: TableActionMethodOptions): ClassDecorator;
export function TableActionMethod<Data extends Record<string, unknown> = Record<string, unknown>>(
  type: string,
  checkFunction?: RowActionCheckFunction<Data>,
): ClassDecorator;
export function TableActionMethod<Data extends Record<string, unknown> = Record<string, unknown>>(
  typeOrOptions: string | TableActionMethodOptions,
  checkFunction?: RowActionCheckFunction<Data>,
): ClassDecorator {
  let type: string | undefined;
  let options: TableActionMethodOptions<Data>;
  if (typeof typeOrOptions === 'string') {
    type = typeOrOptions;
    options = {
      type,
      checkFunction,
    };
  } else {
    options = typeOrOptions;
    type = options.type;
    checkFunction = options.checkFunction;
  }
  return function (target: any) {
    setMetadata(RXAP_TABLE_ACTION_METHOD_METADATA, options, target);
    if (type) {
      setMetadata(RXAP_TABLE_ACTION_METHOD_TYPE_METADATA, type, target);
    }
    if (checkFunction) {
      setMetadata(RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA, checkFunction, target);
    }
  };
}
