import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizeDataGridOptions,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { NormalizeDataGridComponentOptions } from './normalize-data-grid-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeDataGridOptions: jest.fn((o) => ({ ...o, kind: 'data-grid' })),
  AssertAngularOptionsNameProperty: jest.fn(),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  classify: jest.fn((s) => s),
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeDataGridComponentOptions', () => {
  it('should normalize data grid component options', () => {
    const options = { directory: 'dir' };
    const result = NormalizeDataGridComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeDataGridOptions).toHaveBeenCalledWith(options);
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(result.componentName).toBe('test-data-grid');
    expect(result.dataSourceClassName).toBe('testDataGridDataSource');
    expect(result.dataSourceFileName).toBe('test-data-grid.data-source');
  });
});
