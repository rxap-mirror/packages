import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeAutocompleteTableSelectFormControl, IsNormalizedAutocompleteTableSelectFormControl } from './autocomplete-table-select-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c) => ({ ...c })),
}));

jest.mock('./table-select-form-control', () => ({
  NormalizeTableSelectColumn: jest.fn((c) => c),
  NormalizeTableSelectFormControlOptions: jest.fn((o) => o),
  NormalizeTableSelectFormControlResolver: jest.fn((r) => r),
  NormalizeTableSelectToFunction: jest.fn((f) => ({ property: { name: 'test' } })),
}));

jest.mock('../../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn((i) => i),
}));

jest.mock('../../backend/backend-options', () => ({
  NormalizeBackendOptions: jest.fn((o) => ({ kind: o })),
}));

jest.mock('../../data-source/data-source-options', () => ({
  NormalizeDataSourceOptions: jest.fn((o) => o),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l || []),
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

describe('AutocompleteTableSelectFormControl Utilities', () => {
  it('should normalize autocomplete table select form control', () => {
    const control = { name: 'test', columnList: [{ name: 'col1' }] };
    const result = NormalizeAutocompleteTableSelectFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.AUTOCOMPLETE_TABLE_SELECT);
  });

  describe('Type Guards', () => {
    it('IsNormalizedAutocompleteTableSelectFormControl', () => {
      expect(IsNormalizedAutocompleteTableSelectFormControl({ kind: FormControlKinds.AUTOCOMPLETE_TABLE_SELECT } as any)).toBe(true);
    });
  });
});
