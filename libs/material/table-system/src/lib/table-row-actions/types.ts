import { Method } from '@rxap/utilities/rxjs';

export type RowActionCheckFunction<Data extends Record<string, any>> = (element: Data, index: number, array: Data[]) => boolean;
export type TableRowActionTypeSwitchMethod<Data extends Record<string, any>> = Method<any, { element: Data; type: string }>;
export type TableRowActionTypeMethod<Data extends Record<string, any>> = Method<any,
  Data>;
export type TableRowActionMethod<Data extends Record<string, any> = Record<string, any>> =
  | TableRowActionTypeSwitchMethod<Data>
  | TableRowActionTypeMethod<Data>;
