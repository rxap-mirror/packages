import { 
  NormalizeBaseTableColumn, 
  GuessColumnTypeType, 
  TableColumnNameToPropertyPath, 
  TableColumnNameToTitle 
} from './base-table-column';
import { TableColumnKind } from '../table-column-kind';
import { TableColumnModifier } from '../table-column-modifier';

jest.mock('@rxap/schematics-utilities', () => ({
  dasherize: jest.fn((s) => s.toLowerCase()),
  capitalize: jest.fn((s) => s.charAt(0).toUpperCase() + s.slice(1)),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => ({ ...p, type: { name: p.type } })),
  NormalizeTypeImportList: jest.fn((l) => l),
}));

jest.mock('@rxap/utilities', () => ({
  camelize: jest.fn((s) => s),
  classify: jest.fn((s) => s),
  CoerceArrayItems: jest.fn((l, i) => l.push(...i)),
}));

jest.mock('../../form/control/form-control', () => ({
  NormalizeFormControl: jest.fn((c) => ({ ...c, importList: [] })),
}));

jest.mock('../../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => jest.fn()),
}));

jest.mock('../../pipe-option', () => ({
  NormalizePipeOptionList: jest.fn((l) => l),
}));

jest.mock('../../css-class', () => ({
  NormalizeCssClass: jest.fn((c) => c),
  CoerceCssClass: jest.fn((c, n) => ({ name: n })),
}));

describe('BaseTableColumn Utilities', () => {
  describe('Helpers', () => {
    it('GuessColumnTypeType', () => {
      expect(GuessColumnTypeType(TableColumnKind.DATE)).toBe('number | Date');
      expect(GuessColumnTypeType(TableColumnKind.BOOLEAN)).toBe('boolean');
      expect(GuessColumnTypeType(TableColumnKind.DEFAULT, 'string')).toBe('string');
    });

    it('TableColumnNameToPropertyPath', () => {
      expect(TableColumnNameToPropertyPath('user.name')).toBe('user?.name');
      expect(TableColumnNameToPropertyPath('_private')).toBe('_private');
    });

    it('TableColumnNameToTitle', () => {
      expect(TableColumnNameToTitle('user_name')).toBe('User Name');
    });
  });

  describe('NormalizeBaseTableColumn', () => {
    it('should normalize base table column', () => {
      const column = { name: 'test' };
      const result = NormalizeBaseTableColumn(column as any);

      expect(result.name).toBe('test');
      expect(result.kind).toBe(TableColumnKind.DEFAULT);
      expect(result.title).toBe('Test');
    });

    it('should handle modifiers', () => {
      const column = { name: 'test', modifiers: [TableColumnModifier.FILTER, TableColumnModifier.HIDDEN] };
      const result = NormalizeBaseTableColumn(column as any);

      expect(result.hasFilter).toBe(true);
      expect(result.hidden).toBe(true);
      expect(result.filterControl).toBeDefined();
    });

    it('should throw if name is missing', () => {
      expect(() => NormalizeBaseTableColumn({} as any)).toThrow('The column name is required');
    });
  });
});
