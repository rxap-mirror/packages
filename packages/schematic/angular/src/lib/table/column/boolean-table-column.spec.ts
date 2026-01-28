import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeBooleanTableColumn } from './boolean-table-column';
import { TableColumnKind } from '../table-column-kind';

jest.mock('./base-table-column', () => ({
  NormalizeBaseTableColumn: jest.fn((c) => ({ ...c }))
}));

describe('NormalizeBooleanTableColumn', () => {
  it('should normalize boolean table column', () => {
    const column = { name: 'test' };
    const result = NormalizeBooleanTableColumn(column as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(TableColumnKind.BOOLEAN);
  });
});
