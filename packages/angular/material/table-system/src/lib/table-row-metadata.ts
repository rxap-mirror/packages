import { ToggleSubject } from '@rxap/rxjs';

export interface TableRowMetadata {
  /**
   * the unique id of the row. Use to track the row in the table for change detection and other purposes
   */
  __rowId: string;
  /**
   * metadata for the row. Added by the table system to facilitate some features
   */
  __metadata__: {
    loading$: ToggleSubject;
  };
}

export type RawTableRow<T extends TableRowMetadata> = Omit<T, '__metadata__' | '__rowId'>
  & Partial<Pick<TableRowMetadata, '__rowId' | '__metadata__'>>;

export type RowIdMapperFunction<T extends TableRowMetadata> = (row: RawTableRow<T>) => string;

/**
 * Normalize the table row. Add the __rowId and __metadata__ properties to the row.
 *
 * CAUTION: This function mutate the row object
 *
 * @template T extends TableRowMetadata
 * @param row
 * @param rowId
 * @returns T the normalized row
 */
export function NormalizeTableRow<T extends TableRowMetadata>(
  row: RawTableRow<T>,
  rowId: string,
): T;
export function NormalizeTableRow<T extends TableRowMetadata>(
  row: RawTableRow<T>,
  rowIdMapper: RowIdMapperFunction<T>,
): T;
export function NormalizeTableRow<T extends TableRowMetadata>(
  row: RawTableRow<T>,
  rowIdOrMapper: string | RowIdMapperFunction<T>,
): T {
  row.__rowId = typeof rowIdOrMapper === 'string' ? rowIdOrMapper : rowIdOrMapper(row);
  row.__metadata__ ??= { loading$: new ToggleSubject() };
  row.__metadata__.loading$ ??= new ToggleSubject();
  return row as T;
}
