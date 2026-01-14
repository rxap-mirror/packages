import {
  NormalizeAngularOptions,
  NormalizeOperationTableAction,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { CoerceSuffix } from '@rxap/utilities';
import { NormalizeOperationTableActionOptions } from './normalize-operation-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeOperationTableAction: jest.fn((o) => ({ ...o, kind: 'operation', type: 'MyOp' })),
}));

jest.mock('@rxap/workspace-utilities', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
}));

describe('NormalizeOperationTableActionOptions', () => {
  it('should normalize operation table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeOperationTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeOperationTableAction).toHaveBeenCalledWith(options);
    expect(BuildNestControllerName).toHaveBeenCalledWith({
      controllerName: 'MyOp-action',
      nestModule: 'myTable',
    });
    expect(result.tableName).toBe('myTable');
    expect(result.controllerName).toBe('NestController');
  });
});
