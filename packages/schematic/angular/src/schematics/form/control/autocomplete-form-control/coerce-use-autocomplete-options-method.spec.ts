import { CoerceFormDefinitionControl } from '@rxap/schematics-ts-morph';
import { CoerceUseAutocompleteOptionsMethod } from './coerce-use-autocomplete-options-method';

jest.mock('@rxap/schematics-ts-morph', () => ({
  CoerceFormDefinitionControl: jest.fn(() => 'rule'),
  CoerceFormControl: jest.fn(() => ({ propertyDeclaration: {}, decoratorDeclaration: {} })),
}));

jest.mock('@rxap/ts-morph', () => ({
  CoerceDecorator: jest.fn(() => ({ set: jest.fn() })),
  CoerceImports: jest.fn(),
}));

describe('CoerceUseAutocompleteOptionsMethod', () => {
  it('should return a rule', () => {
    const options = { };
    const result = CoerceUseAutocompleteOptionsMethod(options as any, 'token');
    expect(result).toBe('rule');
    expect(CoerceFormDefinitionControl).toHaveBeenCalled();
  });
});
