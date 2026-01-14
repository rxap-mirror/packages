import { NormalizeMinimumTableOptions, MinimumTableModifiers } from './minimum-table-options';

jest.mock('./accordion-identifier', () => ({ NormalizeAccordionIdentifier: jest.fn((i) => i) }));
jest.mock('./css-class', () => ({ NormalizeCssClass: jest.fn((c) => c) }));
jest.mock('./form/control/form-control', () => ({ NormalizeFormControlList: jest.fn((l) => l) }));
jest.mock('./table/table-header-button', () => ({ NormalizeHeaderButton: jest.fn((b) => b) }));
jest.mock('./table/sortable', () => ({ NormalizeSortable: jest.fn((s) => ({ enabled: !!s })) }));
jest.mock('./table/table-action', () => ({ NormalizeTableActionList: jest.fn((l) => l) }));
jest.mock('./table/table-column', () => ({ NormalizeTableColumnList: jest.fn((l) => l) }));
jest.mock('./to-title', () => ({ ToTitle: jest.fn((n) => n) }));
jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => p),
  NormalizeDataPropertyList: jest.fn((l) => l),
  NormalizeUpstreamOptions: jest.fn((u) => u),
}));
jest.mock('@rxap/utilities', () => ({
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
  CoerceSuffix: jest.fn((n, s) => n + s),
}));

describe('NormalizeMinimumTableOptions', () => {
  it('should normalize minimum table options', () => {
    const options = { columnList: [], actionList: [], filterList: [], propertyList: [] };
    const isModifier = (v: string): v is any => true;
    const result = NormalizeMinimumTableOptions(options as any, 'test', isModifier, '-table');
    expect(result.componentName).toBe('test-table');
  });

  it('should throw for unknown modifiers', () => {
    const options = { columnList: [], actionList: [], filterList: [], propertyList: [], modifiers: ['unknown'] };
    const isModifier = (v: string): v is any => v === 'known';
    expect(() => NormalizeMinimumTableOptions(options as any, 'test', isModifier, '-table')).toThrow();
  });
});
