import { NormalizeDialogAction, NormalizeDialogActionList } from './dialog-action';

jest.mock('@rxap/schematics-utilities', () => ({
  capitalize: jest.fn((s) => s.toUpperCase()),
}));

describe('NormalizeDialogAction', () => {
  it('should normalize string input', () => {
    const result = NormalizeDialogAction('close:Cancel');
    expect(result.role).toBe('close');
    expect(result.label).toBe('Cancel');
  });

  it('should capitalize role if label is missing', () => {
    const result = NormalizeDialogAction('submit');
    expect(result.label).toBe('SUBMIT');
  });

  it('should normalize dialog action object', () => {
    const input = { role: 'save', label: 'Save Changes' };
    const result = NormalizeDialogAction(input as any);
    expect(result.role).toBe('save');
    expect(result.label).toBe('Save Changes');
  });

  it('should normalize list', () => {
    const result = NormalizeDialogActionList(['close', 'submit']);
    expect(result).toHaveLength(2);
  });
});
