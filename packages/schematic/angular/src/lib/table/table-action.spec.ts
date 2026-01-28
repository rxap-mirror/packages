import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeTableAction, NormalizeTableActionList } from './table-action';
import { TableActionKind } from './table-action-kind';
import { NormalizeDialogTableAction } from './action/dialog-table-action';
import { NormalizeBaseTableAction } from './action/base-table-action';

jest.mock('./action/dialog-table-action', () => ({ NormalizeDialogTableAction: jest.fn(() => ({ kind: 'dialog' })) }));
jest.mock('./action/form-table-action', () => ({ NormalizeFormTableAction: jest.fn(() => ({ kind: 'form' })) }));
jest.mock('./action/navigation-table-action', () => ({ NormalizeNavigationTableAction: jest.fn(() => ({ kind: 'navigation' })) }));
jest.mock('./action/open-api-table-action', () => ({ NormalizeOpenApiTableAction: jest.fn(() => ({ kind: 'open-api' })) }));
jest.mock('./action/operation-table-action', () => ({ NormalizeOperationTableAction: jest.fn(() => ({ kind: 'operation' })) }));
jest.mock('./action/base-table-action', () => ({ NormalizeBaseTableAction: jest.fn(() => ({ kind: 'default' })) }));

describe('TableAction Multiplexer', () => {
  it('should route to NormalizeDialogTableAction', () => {
    NormalizeTableAction({ kind: TableActionKind.DIALOG } as any, undefined, { kind: BackendTypes.NONE });
    expect(NormalizeDialogTableAction).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseTableAction by default', () => {
    NormalizeTableAction({} as any, undefined, { kind: BackendTypes.NONE });
    expect(NormalizeBaseTableAction).toHaveBeenCalled();
  });

  it('should normalize list of actions', () => {
    const list = [{ kind: TableActionKind.DIALOG }];
    const result = NormalizeTableActionList(list as any, { kind: BackendTypes.NONE });
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('dialog');
  });
});
