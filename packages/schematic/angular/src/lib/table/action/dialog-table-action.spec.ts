import { NormalizeDialogTableAction } from './dialog-table-action';
import { TableActionKind } from '../table-action-kind';
import { NormalizeDialogActionList } from '../../dialog-action';

jest.mock('./base-table-action', () => ({ NormalizeBaseTableAction: jest.fn((a) => ({ ...a })) }));
jest.mock('../../dialog-action', () => ({ NormalizeDialogActionList: jest.fn((l) => l) }));

describe('NormalizeDialogTableAction', () => {
  it('should normalize dialog table action', () => {
    const action = { title: 'Test Dialog', type: 'open' };
    const result = NormalizeDialogTableAction(action as any);

    expect(result.kind).toBe(TableActionKind.DIALOG);
    expect(result.title).toBe('Test Dialog');
    expect(result.actionList).toHaveLength(2); // Cancel and Submit by default
    expect(result.actionList[0].label).toBe('Cancel');
  });

  it('should throw if title is missing', () => {
    expect(() => NormalizeDialogTableAction({ type: 'open' } as any)).toThrow('The title property is required for a dialog table action');
  });
});
