import { NormalizeBaseTableAction } from './base-table-action';
import { TableActionKind } from '../table-action-kind';
import { dasherize } from '@rxap/schematics-utilities';
import { ToTitle } from '../../to-title';

jest.mock('@rxap/schematics-utilities', () => ({ dasherize: jest.fn((s) => s.toLowerCase()) }));
jest.mock('../../to-title', () => ({ ToTitle: jest.fn((s) => s) }));
jest.mock('../../css-class', () => ({ NormalizeCssClass: jest.fn((c) => c) }));

describe('NormalizeBaseTableAction', () => {
  it('should normalize base table action', () => {
    const action = { type: 'TestAction' };
    const result = NormalizeBaseTableAction(action as any);

    expect(result.type).toBe('testaction');
    expect(result.kind).toBe(TableActionKind.DEFAULT);
    expect(result.tooltip).toBe('TestAction');
  });

  it('should throw if type is missing', () => {
    expect(() => NormalizeBaseTableAction({} as any)).toThrow('The type property is required for a table action');
  });
});
