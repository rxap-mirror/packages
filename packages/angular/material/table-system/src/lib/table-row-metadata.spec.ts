import { NormalizeTableRow } from './table-row-metadata';

describe('NormalizeTableRow', () => {
  it('adds the row id and metadata', () => {
    const row: any = { name: 'a' };
    const result = NormalizeTableRow<any>(row, 'id-1');
    expect(result).toBe(row);
    expect(result.__rowId).toBe('id-1');
    expect(result.__metadata__.loading$).toBeDefined();
  });

  it('supports a row id mapper and keeps existing metadata', () => {
    const loading$ = {} as any;
    const row: any = { name: 'a', __metadata__: { loading$ } };
    NormalizeTableRow<any>(row, (r: any) => r.name + '!');
    expect(row.__rowId).toBe('a!');
    expect(row.__metadata__.loading$).toBe(loading$);
  });

  it('adds missing loading$ to existing metadata', () => {
    const row: any = { __metadata__: {} };
    NormalizeTableRow<any>(row, 'x');
    expect(row.__metadata__.loading$).toBeDefined();
  });
});
