import { Method } from '@rxap/pattern';

export type RowActionCheckFunction<Data> = (
  element: Data,
  index: number,
  array: Data[],
) => boolean;

export type TableRowActionTypeSwitchMethod<Data> = Method<any, {
  element: Data;
  type: string
}>;

export type TableRowActionTypeMethod<Data> = Method<any, Data>;

export type TableRowActionMethod<Data = any> =
  | TableRowActionTypeSwitchMethod<Data>
  | TableRowActionTypeMethod<Data>;
