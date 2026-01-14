import {
  NormalizeAngularOptions,
  NormalizeDialogActionList,
  ToTitle,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { normalizeDialogComponentOptions } from './normalize-dialog-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeDialogActionList: jest.fn((l) => l),
  ToTitle: jest.fn((s) => s),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('normalizeDialogComponentOptions', () => {
  it('should normalize dialog component options', () => {
    const options = { dialogName: 'myDialog', directory: 'dir', actionList: [] };
    const result = normalizeDialogComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(CoerceSuffix).toHaveBeenCalledWith('myDialog', '-dialog');
    expect(ToTitle).toHaveBeenCalled();
    expect(result.dialogName).toBe('myDialog-dialog');
    expect(result.directory).toBe('dir/myDialog-dialog');
    expect(result.actionList).toEqual([]);
  });
});
