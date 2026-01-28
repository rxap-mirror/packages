import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeFormHeaderButton, IsFormHeaderButton, IsNormalizedFormHeaderButton } from './form-header-button';
import { HeaderButtonKind } from '../header-button-kind';

jest.mock('./base-header-button', () => ({ NormalizeBaseHeaderButton: jest.fn((o) => ({ ...o })) }));
jest.mock('../../form/form-component', () => ({ NormalizeFormComponent: jest.fn((f) => f) }));

describe('NormalizeFormHeaderButton', () => {
  it('should normalize form header button', () => {
    const options = { kind: HeaderButtonKind.FORM, form: { name: 'test' } };
    const result = NormalizeFormHeaderButton(options as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(HeaderButtonKind.FORM);
    expect(result.form).toBeDefined();
  });

  it('should throw if form is missing', () => {
    expect(() => NormalizeFormHeaderButton({ kind: HeaderButtonKind.FORM } as any, { kind: BackendTypes.NONE })).toThrow('The form property is required for a form header button');
  });

  describe('Type Guards', () => {
    it('IsFormHeaderButton', () => {
      expect(IsFormHeaderButton({ kind: HeaderButtonKind.FORM } as any)).toBe(true);
    });
    it('IsNormalizedFormHeaderButton', () => {
      expect(IsNormalizedFormHeaderButton({ kind: HeaderButtonKind.FORM } as any)).toBe(true);
    });
  });
});
