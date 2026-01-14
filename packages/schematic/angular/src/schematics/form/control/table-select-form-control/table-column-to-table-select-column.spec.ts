import { capitalize } from '@rxap/schematics-utilities';
import { Writers } from 'ts-morph';
import { TableColumnToTableSelectColumn, TableColumnListToTableSelectColumnMap } from './table-column-to-table-select-column';

jest.mock('@rxap/schematics-utilities', () => ({
  capitalize: jest.fn((s) => s),
}));

jest.mock('ts-morph', () => ({
  Writers: {
    object: jest.fn((p) => p),
  },
}));

describe('TableColumnToTableSelectColumn', () => {
  it('should return a writer function for a column', () => {
    const column = { name: 'col', title: 'Col', kind: 'text', hasFilter: true };
    TableColumnToTableSelectColumn(column as any);
    expect(Writers.object).toHaveBeenCalled();
  });

  it('should return a writer function for a column list', () => {
    const column = { name: 'col', title: 'Col', kind: 'text', hasFilter: true };
    TableColumnListToTableSelectColumnMap([column as any]);
    expect(Writers.object).toHaveBeenCalled();
  });
});
