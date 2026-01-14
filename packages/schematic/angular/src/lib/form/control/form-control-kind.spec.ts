import { FormControlKinds } from './form-control-kind';

describe('FormControlKinds', () => {
  it('should have the expected values', () => {
    expect(FormControlKinds.DEFAULT).toBe('default');
    expect(FormControlKinds.INPUT).toBe('input');
    expect(FormControlKinds.SELECT).toBe('select');
    expect(FormControlKinds.CHECKBOX).toBe('checkbox');
    expect(FormControlKinds.SLIDE_TOGGLE).toBe('slide-toggle');
    expect(FormControlKinds.TABLE_SELECT).toBe('table-select');
    expect(FormControlKinds.AUTOCOMPLETE_TABLE_SELECT).toBe('autocomplete-table-select');
    expect(FormControlKinds.AUTOCOMPLETE).toBe('autocomplete');
    expect(FormControlKinds.TEXTAREA).toBe('textarea');
    expect(FormControlKinds.DATE).toBe('date');
  });
});
