import {
  NormalizeAngularOptions,
  NormalizeFormTableAction,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { CoerceSuffix } from '@rxap/utilities';
import { NormalizeFormTableActionOptions } from './normalize-form-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeFormTableAction: jest.fn((o) => ({ ...o, kind: 'form', type: 'MyForm' })),
}));

jest.mock('@rxap/workspace-utilities', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
}));

describe('NormalizeFormTableActionOptions', () => {
  it('should normalize form table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeFormTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeFormTableAction).toHaveBeenCalledWith(options);
    expect(BuildNestControllerName).toHaveBeenCalledWith({
      controllerName: 'MyForm-action',
      nestModule: 'myTable',
    });
    expect(result.tableName).toBe('myTable');
    expect(result.controllerName).toBe('NestController');
  });
});
