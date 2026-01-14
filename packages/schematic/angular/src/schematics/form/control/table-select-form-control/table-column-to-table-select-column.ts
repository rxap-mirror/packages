import { NormalizedTableSelectColumn } from '@rxap/schematic-angular';
import { capitalize } from '@rxap/schematics-utilities';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export function TableColumnToTableSelectColumn(column: NormalizedTableSelectColumn): WriterFunction {
  const {
    kind,
    name,
    title,
    hasFilter,
  } = column;
  const properties: Record<string, string | WriterFunction> = {};
  properties['label'] = `$localize\`${ title ?? capitalize(name) }\``;
  if (hasFilter) {
    properties['filter'] = 'true';
  }
  properties['type'] = (w) => w.quote(kind);
  return Writers.object(properties);
}

export function TableColumnListToTableSelectColumnMap(
  columnList: Array<NormalizedTableSelectColumn>,
): WriterFunction {
  return Writers.object(
    columnList.reduce(
      (properties, column) => (
        {
          ...properties,
          [column.name]: TableColumnToTableSelectColumn(column),
        }
      ),
      {},
    ),
  );
}