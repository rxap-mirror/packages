import { NormalizeNavigationTableAction } from './navigation-table-action';
import { TableActionKind } from '../table-action-kind';

jest.mock('./base-table-action', () => ({ NormalizeBaseTableAction: jest.fn((a) => ({ ...a })) }));

describe('NormalizeNavigationTableAction', () => {
  it('should normalize navigation table action', () => {
    const action = { type: 'Nav', route: '/home' };
    const result = NormalizeNavigationTableAction(action as any);

    expect(result.kind).toBe(TableActionKind.NAVIGATION);
    expect(result.route).toBe('/home');
  });

  it('should throw if route is missing', () => {
    expect(() => NormalizeNavigationTableAction({ type: 'Nav' } as any)).toThrow('The route property is required for a navigation table action');
  });
});
