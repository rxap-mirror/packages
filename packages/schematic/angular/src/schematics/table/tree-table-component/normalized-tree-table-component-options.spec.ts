import {
  AssertAngularOptionsNameProperty,
  IsTreeTableModifiers,
  NormalizeMinimumTableComponentOptions,
  NormalizeTreeTableOptions,
} from '@rxap/schematic-angular';
import { NormalizedTreeTableComponentOptions } from './normalized-tree-table-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeMinimumTableComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  AssertAngularOptionsNameProperty: jest.fn(),
  IsTreeTableModifiers: jest.fn(),
  NormalizeTreeTableOptions: jest.fn((o) => ({ ...o, kind: 'tree' })),
}));

describe('NormalizedTreeTableComponentOptions', () => {
  it('should normalize tree table component options', () => {
    const options = { name: 'test' };
    const result = NormalizedTreeTableComponentOptions(options as any);

    expect(NormalizeMinimumTableComponentOptions).toHaveBeenCalledWith(options, IsTreeTableModifiers, '-tree-table');
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(NormalizeTreeTableOptions).toHaveBeenCalledWith(options, 'test');
    expect(result.name).toBe('test');
  });
});
