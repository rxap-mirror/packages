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
import { HeaderButtonKind } from '../table/header-button-kind';
import { headerButtonRule } from './table-header-button-rule';

const base: any = {
  project: 'ui-lib',
  feature: undefined,
  backend: { kind: 'local' },
  shared: false,
  directory: 'dir',
  context: 'ctx',
  nestModule: undefined,
  controllerName: 'user',
  componentName: 'user-table',
};

async function run(headerButton: any) {
  await firstValueFrom(callRule(headerButtonRule({ ...base, headerButton }), new HostTree(), {} as any) as any);
}

describe('headerButtonRule', () => {
  beforeEach(() => {
    executeSchematic.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('does nothing without a header button', async () => {
    await run(undefined);
    expect(executeSchematic).not.toHaveBeenCalled();
  });

  it.each([
    [ HeaderButtonKind.FORM, 'form-table-header-button' ],
    [ HeaderButtonKind.NAVIGATION, 'navigation-table-header-button' ],
    [ HeaderButtonKind.METHOD, 'method-table-header-button' ],
    [ HeaderButtonKind.DEFAULT, 'table-header-button' ],
  ])('executes the schematic for the %s kind', async (kind, schematic) => {
    await run({ kind, name: 'create' });
    expect(executeSchematic).toHaveBeenCalledTimes(1);
    const [ name, options ] = executeSchematic.mock.calls[0];
    expect(name).toBe(schematic);
    expect(options).toEqual(expect.objectContaining({ tableName: 'user-table', project: 'ui-lib', name: 'create' }));
  });

  it('falls back to the controller name as nest module for form buttons', async () => {
    await run({ kind: HeaderButtonKind.FORM, name: 'create' });
    expect(executeSchematic.mock.calls[0][1].nestModule).toBe('user');
  });
});
