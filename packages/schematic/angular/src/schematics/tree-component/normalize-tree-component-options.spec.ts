import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { NormalizeTreeComponentOptions } from './normalize-tree-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  AssertAngularOptionsNameProperty: jest.fn(),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeTreeComponentOptions', () => {
  it('should normalize tree component options', () => {
    const options = { };
    const result = NormalizeTreeComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(dasherize).toHaveBeenCalledWith('test');
    expect(CoerceSuffix).toHaveBeenCalledWith('test', '-tree');
    expect(result.componentName).toBe('test-tree');
    expect(result.fullTree).toBe(true);
  });
});
