import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizeControlList,
} from '@rxap/schematic-angular';
import { NormalizeFormDefinitionOptions } from './normalize-form-definition-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  AssertAngularOptionsNameProperty: jest.fn(),
  NormalizeControlList: jest.fn((l) => l),
}));

describe('NormalizeFormDefinitionOptions', () => {
  it('should normalize form definition options', () => {
    const options = { controlList: [] };
    const result = NormalizeFormDefinitionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(NormalizeControlList).toHaveBeenCalledWith([]);
    expect(result.standalone).toBe(true);
  });
});
