import { NormalizeFormTableAction } from './form-table-action';
import { TableActionKind } from '../table-action-kind';

jest.mock('./base-table-action', () => ({ NormalizeBaseTableAction: jest.fn((a) => ({ ...a })) }));
jest.mock('../../form/form-component', () => ({ NormalizeFormComponent: jest.fn((f) => f) }));
jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((s, suf) => s + suf),
  dasherize: jest.fn((s) => s.toLowerCase()),
}));

describe('NormalizeFormTableAction', () => {
  it('should normalize form table action', () => {
    const action = { type: 'Edit', form: { name: 'testForm' } };
    const result = NormalizeFormTableAction(action as any);

    expect(result.kind).toBe(TableActionKind.FORM);
    expect(result.formComponent).toBe('edit-form');
    expect(result.form).toBeDefined();
  });

  it('should handle customComponent', () => {
    const action = { type: 'Edit', customComponent: true };
    const result = NormalizeFormTableAction(action as any);
    expect(result.customComponent).toBe(true);
  });
});
