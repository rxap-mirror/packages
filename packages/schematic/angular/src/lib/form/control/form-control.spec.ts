import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeFormControl, NormalizeFormControlList } from './form-control';
import { FormControlKinds } from './form-control-kind';
import { NormalizeInputFormControl } from './input-form-control';
import { NormalizeSelectFormControl } from './select-form-control';
import { NormalizeBaseFormControl } from './base-form-control';

jest.mock('./input-form-control', () => ({ NormalizeInputFormControl: jest.fn(() => ({ kind: 'input' })) }));
jest.mock('./select-form-control', () => ({ NormalizeSelectFormControl: jest.fn(() => ({ kind: 'select' })) }));
jest.mock('./base-form-control', () => ({ NormalizeBaseFormControl: jest.fn(() => ({ kind: 'default' })) }));
jest.mock('./checkbox-form-control', () => ({ NormalizeCheckboxFormControl: jest.fn() }));
jest.mock('./slide-toggle-form-control', () => ({ NormalizeSlideToggleFormControl: jest.fn() }));
jest.mock('./table-select-form-control', () => ({ NormalizeTableSelectFormControl: jest.fn() }));
jest.mock('./autocomplete-table-select-form-control', () => ({ NormalizeAutocompleteTableSelectFormControl: jest.fn() }));
jest.mock('./textarea-form-control', () => ({ NormalizeTextareaFormControl: jest.fn() }));
jest.mock('./autocomplete-form-control', () => ({ NormalizeAutocompleteFormControl: jest.fn() }));
jest.mock('./date-form-control', () => ({ NormalizeDateFormControl: jest.fn() }));

describe('NormalizeFormControl Multiplexer', () => {
  it('should route to NormalizeInputFormControl', () => {
    NormalizeFormControl({ kind: FormControlKinds.INPUT } as any, { kind: BackendTypes.NONE });
    expect(NormalizeInputFormControl).toHaveBeenCalled();
  });

  it('should route to NormalizeSelectFormControl', () => {
    NormalizeFormControl({ kind: FormControlKinds.SELECT } as any, { kind: BackendTypes.NONE });
    expect(NormalizeSelectFormControl).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseFormControl for default', () => {
    NormalizeFormControl({ kind: FormControlKinds.DEFAULT } as any, { kind: BackendTypes.NONE });
    expect(NormalizeBaseFormControl).toHaveBeenCalled();
  });

  describe('NormalizeFormControlList', () => {
    it('should map over controls', () => {
      const result = NormalizeFormControlList([{ kind: FormControlKinds.INPUT } as any], { kind: BackendTypes.NONE });
      expect(result).toHaveLength(1);
    });

    it('should return empty array for undefined', () => {
      expect(NormalizeFormControlList([], { kind: BackendTypes.NONE })).toEqual([]);
    });
  });
});
