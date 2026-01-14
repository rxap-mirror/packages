import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizeFormComponent,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { dasherize } from '@rxap/utilities';
import { NormalizeFormComponentOptions } from './normalize-form-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  AssertAngularOptionsNameProperty: jest.fn(),
  NormalizeFormComponent: jest.fn((o) => ({ ...o, kind: 'form' })),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
}));

jest.mock('@rxap/utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeFormComponentOptions', () => {
  it('should normalize form component options', () => {
    const options = { directory: 'dir', context: 'ctx' };
    const result = NormalizeFormComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(CoerceSuffix).toHaveBeenCalledWith('test', '-form');
    expect(BuildNestControllerName).toHaveBeenCalled();
    expect(result.componentName).toBe('test-form');
    expect(result.directory).toBe('dir/test-form');
    expect(result.context).toBe('ctx');
  });
});
