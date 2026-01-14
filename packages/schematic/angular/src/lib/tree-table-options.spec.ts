import {
  NormalizeTreeTableOptions,
  IsTreeTableModifiers,
} from './tree-table-options';
import { NormalizeMinimumTableOptions } from './minimum-table-options';
import { NormalizeExistingMethod } from './existing-method';

jest.mock('./minimum-table-options', () => ({
  NormalizeMinimumTableOptions: jest.fn((o) => ({ ...o, componentName: 'test' })),
}));

jest.mock('./existing-method', () => ({
  NormalizeExistingMethod: jest.fn((m) => m ? 'normalized-method' : null),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l),
  NormalizeDataProperty: jest.fn((p) => p),
}));

describe('NormalizeTreeTableOptions', () => {
  it('should normalize tree table options', () => {
    const options = { columnList: [], tableRootMethod: { name: 'root' } };
    const result = NormalizeTreeTableOptions(options as any, 'test');

    expect(NormalizeMinimumTableOptions).toHaveBeenCalled();
    expect(NormalizeExistingMethod).toHaveBeenCalledWith({ name: 'root' });
    expect(result.componentName).toBe('test');
    expect(result.tableRootMethod).toBe('normalized-method');
    // Check if tree and spinner columns were added
    expect(result.columnList).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ name: 'tree' }),
            expect.objectContaining({ name: 'spinner' }),
        ])
    );
  });

  it('IsTreeTableModifiers should return true for valid modifiers', () => {
    expect(IsTreeTableModifiers('overwrite')).toBe(true);
    expect(IsTreeTableModifiers('invalid')).toBe(false);
  });
});
