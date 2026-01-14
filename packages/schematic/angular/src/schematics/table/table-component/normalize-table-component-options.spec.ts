import {
  AssertAngularOptionsNameProperty,
  BackendTypes,
  IsTableModifiers,
  NormalizeMinimumTableComponentOptions,
  NormalizeTableOptions,
} from '@rxap/schematic-angular';
import { NormalizeTableComponentOptions } from './normalize-table-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeMinimumTableComponentOptions: jest.fn(),
  AssertAngularOptionsNameProperty: jest.fn(),
  IsTableModifiers: jest.fn(),
  NormalizeTableOptions: jest.fn(),
  BackendTypes: {
    OPEN_API: 'open-api',
  },
}));

describe('NormalizeTableComponentOptions', () => {
  it('should normalize table component options', () => {
    const options = { name: 'test' };
    (NormalizeMinimumTableComponentOptions as jest.Mock).mockReturnValue({ name: 'test', backend: { kind: 'other' } });
    (NormalizeTableOptions as jest.Mock).mockReturnValue({ openApi: null });

    const result = NormalizeTableComponentOptions(options as any);

    expect(NormalizeMinimumTableComponentOptions).toHaveBeenCalledWith(options, IsTableModifiers, '-table');
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(NormalizeTableOptions).toHaveBeenCalledWith(options, 'test');
    expect(result).toEqual({ name: 'test', backend: { kind: 'other' }, openApi: null });
  });

  it('should throw if backend is open-api and openApi options are missing', () => {
    const options = { name: 'test' };
    (NormalizeMinimumTableComponentOptions as jest.Mock).mockReturnValue({ name: 'test', backend: { kind: BackendTypes.OPEN_API } });
    (NormalizeTableOptions as jest.Mock).mockReturnValue({ openApi: null });

    expect(() => NormalizeTableComponentOptions(options as any)).toThrow('openApi options must be provided. If backend is open-api');
  });
});
