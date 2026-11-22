/** @jest-environment node */
const executeSchematic = jest.fn((name: string, options: any) => () => undefined);
jest.mock('@rxap/schematics-utilities', () => ({
  ...jest.requireActual('@rxap/schematics-utilities'),
  ExecuteSchematic: (name: string, options: any) => executeSchematic(name, options),
}));

import {
  callRule,
  HostTree,
} from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';
import { TableActionKind } from '../table/table-action-kind';
import { actionListRule } from './table-action-rule';

const baseOptions: any = {
  overwrite: false,
  project: 'ui-lib',
  feature: undefined,
  shared: false,
  backend: { kind: 'local' },
  componentName: 'user-table',
  directory: 'dir',
  nestModule: 'user',
  controllerName: 'user',
  context: 'ctx',
};

async function run(actionList: any[], options: any = {}) {
  const rule = actionListRule({ ...baseOptions, ...options, actionList });
  await firstValueFrom(callRule(rule, new HostTree(), {} as any) as any);
}

describe('actionListRule', () => {
  beforeEach(() => {
    executeSchematic.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('does nothing without actions', async () => {
    await run([]);
    expect(executeSchematic).not.toHaveBeenCalled();
  });

  it.each([
    [ TableActionKind.OPERATION, 'operation-table-action' ],
    [ TableActionKind.FORM, 'form-table-action' ],
    [ TableActionKind.NAVIGATION, 'navigation-table-action' ],
    [ TableActionKind.DIALOG, 'dialog-table-action' ],
    [ TableActionKind.OPEN_API, 'open-api-table-action' ],
    [ TableActionKind.DEFAULT, 'table-action' ],
  ])('executes the %s action schematic', async (kind, schematic) => {
    await run([ { kind, type: 'archive' } ]);
    expect(executeSchematic).toHaveBeenCalledTimes(1);
    const [ name, options ] = executeSchematic.mock.calls[0];
    expect(name).toBe(schematic);
    expect(options).toEqual(expect.objectContaining({ kind, type: 'archive', tableName: 'user-table', project: 'ui-lib', directory: 'dir' }));
  });

  it('builds a dedicated controller name for form actions', async () => {
    await run([ { kind: TableActionKind.FORM, type: 'edit' } ]);
    expect(executeSchematic.mock.calls[0][1].controllerName).toContain('edit');
  });

  it('executes all actions in order', async () => {
    await run([ { kind: TableActionKind.DEFAULT, type: 'a' }, { kind: TableActionKind.DIALOG, type: 'b' } ]);
    expect(executeSchematic.mock.calls.map(c => c[0])).toEqual([ 'table-action', 'dialog-table-action' ]);
  });
});
