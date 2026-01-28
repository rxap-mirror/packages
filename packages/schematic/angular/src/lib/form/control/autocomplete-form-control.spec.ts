import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeAutocompleteFormControl, IsNormalizedAutocompleteFormControl } from './autocomplete-form-control';
import { FormControlKinds } from './form-control-kind';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c) => ({ ...c })),
}));

jest.mock('../../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn((i) => i),
}));

jest.mock('../../backend/backend-options', () => ({
  NormalizeBackendOptions: jest.fn((o) => ({ kind: o })),
}));

jest.mock('../../utilities/to-function', () => ({
  NormalizeToFunction: jest.fn((f) => f ? ({ ...f, property: { name: 'test' } }) : null),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l || []),
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

describe('AutocompleteFormControl Utilities', () => {
  it('should normalize autocomplete form control', () => {
    const control = { name: 'test' };
    const result = NormalizeAutocompleteFormControl(control as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(FormControlKinds.AUTOCOMPLETE);
  });

  describe('Type Guards', () => {
    it('IsNormalizedAutocompleteFormControl', () => {
      expect(IsNormalizedAutocompleteFormControl({ kind: FormControlKinds.AUTOCOMPLETE } as any)).toBe(true);
    });
  });
});
