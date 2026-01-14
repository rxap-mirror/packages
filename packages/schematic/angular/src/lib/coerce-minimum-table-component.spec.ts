import { CoerceMinimumTableComponentRule } from './coerce-minimum-table-component';

jest.mock('@rxap/schematics-ts-morph', () => ({
  CoerceComponentRule: jest.fn((o) => () => {}),
}));
jest.mock('./load-handlebars-template', () => ({ LoadMatFormFieldHandlebarsTemplate: jest.fn() }));

describe('CoerceMinimumTableComponentRule', () => {
  it('should return a rule function', () => {
    const options = { table: { columnList: [], actionList: [], filterList: [], modifiers: [] } };
    const rule = CoerceMinimumTableComponentRule(options as any);
    expect(typeof rule).toBe('function');
  });
});
