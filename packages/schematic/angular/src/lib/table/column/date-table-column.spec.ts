import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeDateTableColumn } from './date-table-column';
import { TableColumnKind } from '../table-column-kind';

jest.mock('./base-table-column', () => ({
  NormalizeBaseTableColumn: jest.fn((c) => ({ ...c }))
}));

describe('NormalizeDateTableColumn', () => {
  it('should normalize date table column', () => {
    const column = { name: 'test' };
    const result = NormalizeDateTableColumn(column as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(TableColumnKind.DATE);
    expect(result.format).toBe('dd.MM.yyyy HH:mm:ss');
  });

  it('should use provided format', () => {
    const column = { name: 'test', format: 'yyyy' };
    const result = NormalizeDateTableColumn(column as any, { kind: BackendTypes.NONE });
    expect(result.format).toBe('yyyy');
  });
});
