import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeTableSelectFormControl, NormalizeTableSelectColumn, IsNormalizedTableSelectFormControl } from './table-select-form-control';
import { FormControlKinds } from './form-control-kind';
import { TableColumnKind } from '../../table/table-column-kind';

jest.mock('./form-field-form-control', () => ({
  NormalizeFormFieldFormControl: jest.fn((c) => ({ ...c })),
}));

jest.mock('../../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn((i) => i),
}));

jest.mock('../../backend/backend-options', () => ({
  NormalizeBackendOptions: jest.fn((o) => ({ kind: o })),
}));

jest.mock('../../data-source/data-source-options', () => ({
  NormalizeDataSourceOptions: jest.fn((o) => o),
}));

jest.mock('../../method/method-options', () => ({
  NormalizeMethodOptions: jest.fn((o) => o),
}));

jest.mock('../../utilities/to-function', () => ({
  NormalizeToFunction: jest.fn((f) => ({ ...f })),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => typeof p === 'string' ? { name: p } : p),
  NormalizeDataPropertyList: jest.fn((l) => l || []),
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

describe('TableSelectFormControl Utilities', () => {
  describe('NormalizeTableSelectColumn', () => {
    it('should normalize column', () => {
      const result = NormalizeTableSelectColumn({ name: 'test' });
      expect(result.name).toBe('test');
      expect(result.kind).toBe(TableColumnKind.DEFAULT);
    });

    it('should throw if name is missing', () => {
      expect(() => NormalizeTableSelectColumn({} as any)).toThrow('The column name is required');
    });
  });

  describe('NormalizeTableSelectFormControl', () => {
    it('should normalize table select form control', () => {
      const control = { name: 'test', columnList: [{ name: 'col1' }] };
      const result = NormalizeTableSelectFormControl(control as any, { kind: BackendTypes.NONE });

      expect(result.kind).toBe(FormControlKinds.TABLE_SELECT);
      expect(result.columnList).toHaveLength(1);
    });

    it('should throw if columnList is empty', () => {
      expect(() => NormalizeTableSelectFormControl({ name: 'test', columnList: [] } as any, { kind: BackendTypes.NONE })).toThrow('The column list must not be empty');
    });
  });

  describe('Type Guards', () => {
    it('IsNormalizedTableSelectFormControl', () => {
      expect(IsNormalizedTableSelectFormControl({ kind: FormControlKinds.TABLE_SELECT } as any)).toBe(true);
    });
  });
});
