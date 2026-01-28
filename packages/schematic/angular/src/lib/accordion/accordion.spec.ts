import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeAccordion } from './accordion';
import * as tsMorph from '@rxap/ts-morph';
import { NormalizeAccordionItemList } from './accordion-item';
import { NormalizeAccordionHeader } from './accordion-header';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l),
  NormalizeTypeImportList: jest.fn((l) => l),
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

jest.mock('./accordion-item', () => ({
  NormalizeAccordionItemList: jest.fn((l) => l || []),
}));

jest.mock('./accordion-header', () => ({
  NormalizeAccordionHeader: jest.fn(() => null),
}));

jest.mock('../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn(() => null),
}));

jest.mock('../persistent', () => ({
  NormalizePersistent: jest.fn((p) => p),
}));

describe('NormalizeAccordion', () => {
  it('should normalize accordion with default values', () => {
    const options = { name: 'test-accordion' };
    const result = NormalizeAccordion(options, { kind: BackendTypes.NONE });

    expect(result.name).toBe('test-accordion');
    expect(result.multiple).toBe(false);
    expect(result.itemList).toEqual([]);
    expect(result.withPermission).toBe(false);
  });

  it('should set withPermission if any item has permission', () => {
    (NormalizeAccordionItemList as jest.Mock).mockReturnValue([
      { permission: 'view' }
    ]);
    const result = NormalizeAccordion({ name: 'test' }, { kind: BackendTypes.NONE });
    expect(result.withPermission).toBe(true);
  });

  it('should handle persistent storage', () => {
    const options = { name: 'test', persistent: { key: 'test-key' } as any };
    const result = NormalizeAccordion(options, { kind: BackendTypes.NONE });
    expect(result.persistent).toEqual({ key: 'test-key' });
  });
});
