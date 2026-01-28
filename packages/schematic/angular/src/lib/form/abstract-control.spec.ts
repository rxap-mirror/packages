import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeAbstractControl, AbstractControlRolls } from './abstract-control';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => ({ name: p.name })),
  NormalizeTypeImportList: jest.fn((l) => l),
}));

jest.mock('../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => 'mock-handlebars'),
}));

describe('NormalizeAbstractControl', () => {
  it('should normalize with default values', () => {
    const control = { name: 'testControl' };
    const result = NormalizeAbstractControl(control as any, 'input', undefined, undefined, undefined, undefined, { kind: BackendTypes.NONE });

    expect(result.name).toBe('testControl');
    expect(result.role).toBe(AbstractControlRolls.CONTROL);
    expect(result.template).toBe('input-form-control.hbs');
    expect(result.isDisabled).toBe(false);
    expect(result.isReadonly).toBe(false);
    expect(result.isRequired).toBe(false);
  });

  it('should throw if name is missing', () => {
    expect(() => NormalizeAbstractControl({} as any, 'input', undefined, undefined, undefined, undefined, { kind: BackendTypes.NONE })).toThrow('The control name is required');
  });

  it('should override role and template', () => {
    const control = { name: 'test', role: AbstractControlRolls.GROUP, template: 'custom.hbs' };
    const result = NormalizeAbstractControl(control as any, 'input', undefined, undefined, undefined, undefined, { kind: BackendTypes.NONE });

    expect(result.role).toBe(AbstractControlRolls.GROUP);
    expect(result.template).toBe('custom.hbs');
  });
});
