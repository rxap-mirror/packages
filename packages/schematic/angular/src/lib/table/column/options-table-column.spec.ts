import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeOptionsTableColumn } from './options-table-column';
import { TableColumnKind } from '../table-column-kind';

jest.mock('./base-table-column', () => ({
  NormalizeBaseTableColumn: jest.fn((c) => ({ ...c }))
}));

jest.mock('@rxap/utilities', () => ({
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
}));

describe('NormalizeOptionsTableColumn', () => {
  it('should normalize options table column', () => {
    const column = { name: 'test', optionList: [{ value: '1', display: 'One' }] };
    const result = NormalizeOptionsTableColumn(column as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(TableColumnKind.OPTIONS);
    expect(result.optionList).toEqual([{ value: '1', display: 'One' }]);
  });
});
