import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeCustomTableColumn } from './custom-table-column';
import { TableColumnKind } from '../table-column-kind';

jest.mock('./base-table-column', () => ({
  NormalizeBaseTableColumn: jest.fn((c) => ({ ...c }))
}));

describe('NormalizeCustomTableColumn', () => {
  it('should normalize custom table column', () => {
    const column = { name: 'test', html: '<span>test</span>' };
    const result = NormalizeCustomTableColumn(column as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(TableColumnKind.CUSTOM);
    expect(result.html).toBe('<span>test</span>');
  });

  it('should provide default html if missing', () => {
    const result = NormalizeCustomTableColumn({ name: 'test' } as any, { kind: BackendTypes.NONE });
    expect(result.html).toBe('TODO: set html property');
  });
});
