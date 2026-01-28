import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeDataGridOptions } from './data-grid-options';
import { DataGridMode } from './data-grid-mode';

jest.mock('./data-grid-item', () => ({ NormalizeDataGridItemList: jest.fn((l) => l ?? []) }));
jest.mock('./accordion-identifier', () => ({ NormalizeAccordionIdentifier: jest.fn((i) => i) }));
jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l),
  NormalizeUpstreamOptions: jest.fn((u) => u),
}));
jest.mock('@rxap/utilities', () => ({
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
  DeleteEmptyProperties: jest.fn((p) => p),
}));

describe('NormalizeDataGridOptions', () => {
  it('should normalize data grid options', () => {
    const options = { itemList: [], mode: DataGridMode.Form };
    const result = NormalizeDataGridOptions(options as any, { kind: BackendTypes.NONE });
    expect(result.mode).toBe(DataGridMode.Form);
    expect(result.isForm).toBe(true);
  });

  it('should default to plain mode', () => {
    const result = NormalizeDataGridOptions({} as any, { kind: BackendTypes.NONE });
    expect(result.mode).toBe(DataGridMode.Plain);
  });
});
