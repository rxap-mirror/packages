import { NormalizeTableColumn, NormalizeTableColumnList } from './table-column';
import { TableColumnKind } from './table-column-kind';
import { NormalizeDateTableColumn } from './column/date-table-column';
import { NormalizeBaseTableColumn } from './column/base-table-column';

jest.mock('./column/date-table-column', () => ({ NormalizeDateTableColumn: jest.fn(() => ({ kind: 'date', name: 'd' })) }));
jest.mock('./column/custom-table-column', () => ({ NormalizeCustomTableColumn: jest.fn(() => ({ kind: 'custom', name: 'c' })) }));
jest.mock('./column/boolean-table-column', () => ({ NormalizeBooleanTableColumn: jest.fn(() => ({ kind: 'boolean', name: 'b' })) }));
jest.mock('./column/options-table-column', () => ({ NormalizeOptionsTableColumn: jest.fn(() => ({ kind: 'options', name: 'o' })) }));
jest.mock('./column/base-table-column', () => ({ NormalizeBaseTableColumn: jest.fn(() => ({ kind: 'default', name: 'df' })) }));

describe('TableColumn Multiplexer', () => {
  it('should route to NormalizeDateTableColumn', () => {
    NormalizeTableColumn({ kind: TableColumnKind.DATE } as any);
    expect(NormalizeDateTableColumn).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseTableColumn by default', () => {
    NormalizeTableColumn({} as any);
    expect(NormalizeBaseTableColumn).toHaveBeenCalled();
  });

  it('should normalize and sort column list', () => {
    const list = [
      { name: 'end', stickyEnd: true },
      { name: 'mid' },
      { name: 'start', stickyStart: true },
    ];
    // We need to mock return values that include sticky flags for sorting to work as expected if sorting relies on them
    (NormalizeBaseTableColumn as jest.Mock).mockImplementation((c) => ({ ...c }));

    const result = NormalizeTableColumnList(list as any);
    expect(result[0].name).toBe('start');
    expect(result[result.length - 1].name).toBe('end');
  });
});
