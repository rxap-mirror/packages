import { NormalizeOperationTableAction } from './operation-table-action';
import { TableActionKind } from '../table-action-kind';

jest.mock('./base-table-action', () => ({ NormalizeBaseTableAction: jest.fn((a) => ({ ...a })) }));

describe('NormalizeOperationTableAction', () => {
  it('should normalize operation table action', () => {
    const action = { type: 'Op' };
    const result = NormalizeOperationTableAction(action as any);

    expect(result.kind).toBe(TableActionKind.OPERATION);
  });
});
