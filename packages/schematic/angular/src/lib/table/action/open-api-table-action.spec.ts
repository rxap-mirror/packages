import { NormalizeOpenApiTableAction } from './open-api-table-action';
import { TableActionKind } from '../table-action-kind';

jest.mock('./base-table-action', () => ({ NormalizeBaseTableAction: jest.fn((a) => ({ ...a })) }));

describe('NormalizeOpenApiTableAction', () => {
  it('should normalize open api table action', () => {
    const action = { type: 'Api', operationId: 'getUsers' };
    const result = NormalizeOpenApiTableAction(action as any);

    expect(result.kind).toBe(TableActionKind.OPEN_API);
    expect(result.operationId).toBe('getUsers');
  });

  it('should throw if operationId is missing', () => {
    expect(() => NormalizeOpenApiTableAction({ type: 'Api' } as any)).toThrow('The operationId property is required for an open api table action');
  });
});
