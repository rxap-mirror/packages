import {
  NormalizeAngularOptions,
  NormalizeFormHeaderButton,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import { NormalizeFormTableHeaderButtonOptions } from './normalize-form-table-header-button-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeFormHeaderButton: jest.fn((o) => ({ ...o, kind: 'form' })),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('NormalizeFormTableHeaderButtonOptions', () => {
  it('should normalize form table header button options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeFormTableHeaderButtonOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeFormHeaderButton).toHaveBeenCalledWith(options, 'myTable');
    expect(BuildNestControllerName).toHaveBeenCalledWith({
      nestModule: undefined,
      controllerName: undefined,
      controllerNameSuffix: 'header-button',
    });
    expect(result.tableName).toBe('myTable-table');
    expect(result.controllerName).toBe('NestController');
  });
});
