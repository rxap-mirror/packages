import { NormalizeDataGridItem, NormalizeDataGridItemList, DataGridKinds } from './data-grid-item';

jest.mock('./load-handlebars-template', () => ({ LoadHandlebarsTemplate: jest.fn(() => jest.fn()) }));
jest.mock('./pipe-option', () => ({ NormalizePipeOptionList: jest.fn((l) => l ?? []) }));
jest.mock('./pipe-option-to-type-import', () => ({ PipeOptionToTypeImport: jest.fn((p) => p) }));
jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => ({ ...p, type: { name: p.type } })),
  NormalizeTypeImportList: jest.fn((l) => l),
}));
jest.mock('@rxap/utilities', () => ({
  capitalize: jest.fn((s) => s),
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
  dasherize: jest.fn((s) => s),
}));
jest.mock('./form/control', () => ({ NormalizeControl: jest.fn((c) => ({ ...c, importList: [] })) }));

describe('DataGridItem', () => {
  it('should normalize base data grid item', () => {
    const item = { name: 'test' };
    const result = NormalizeDataGridItem(item as any);
    expect(result.name).toBe('test');
    expect(result.kind).toBe(DataGridKinds.DEFAULT);
  });

  it('should normalize link data grid item', () => {
    const item = { name: 'test', kind: DataGridKinds.LINK, target: '_blank' };
    const result: any = NormalizeDataGridItem(item as any);
    expect(result.kind).toBe(DataGridKinds.LINK);
    expect(result.target).toBe('_blank');
  });

  it('should normalize list', () => {
    const list = [{ name: 'a' }, { name: 'b' }];
    const result = NormalizeDataGridItemList(list as any);
    expect(result).toHaveLength(2);
  });
});
