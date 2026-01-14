import {
  NormalizeAngularOptions,
  NormalizeDialogTableAction,
} from '@rxap/schematic-angular';
import { NormalizeDialogTableActionOptions } from './normalize-dialog-table-action-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeDialogTableAction: jest.fn((o) => ({ ...o, kind: 'dialog' })),
}));

describe('NormalizeDialogTableActionOptions', () => {
  it('should normalize dialog table action options', () => {
    const options = { tableName: 'myTable' };
    const result = NormalizeDialogTableActionOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeDialogTableAction).toHaveBeenCalledWith(options);
    expect(result.tableName).toBe('myTable');
    expect(result.kind).toBe('dialog');
  });
});
