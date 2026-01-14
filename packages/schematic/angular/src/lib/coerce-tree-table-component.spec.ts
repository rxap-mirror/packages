import { CoerceTreeTableComponentRule } from './coerce-tree-table-component';

jest.mock('@rxap/schematics-ts-morph', () => ({
  AddComponentProvider: jest.fn(),
}));
jest.mock('./coerce-minimum-table-component', () => ({
  CoerceMinimumTableComponentRule: jest.fn(() => () => {}),
}));

describe('CoerceTreeTableComponentRule', () => {
  it('should call CoerceMinimumTableComponentRule', () => {
    const options = { table: { } };
    const rule = CoerceTreeTableComponentRule(options as any);
    expect(typeof rule).toBe('function');
  });
});
