import { PrintAngularOptions } from './print-angular-options';
import { PrintGeneralOptions } from '@rxap/schematics-utilities';
import { BackendTypes } from './backend/backend-types';

jest.mock('@rxap/schematics-utilities', () => ({
  PrintGeneralOptions: jest.fn(),
}));

describe('PrintAngularOptions', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should call PrintGeneralOptions and log basic properties', () => {
    const options = {
      name: 'test-name',
      componentName: 'test-comp',
      directory: 'test-dir',
      context: 'test-ctx',
      backend: { kind: BackendTypes.NONE },
    } as any;

    PrintAngularOptions('my-schematic', options);

    expect(PrintGeneralOptions).toHaveBeenCalledWith('my-schematic', options);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Name: test-name'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Component Name: test-comp'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Directory: test-dir'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Context: test-ctx'));
  });

  it('should log NESTJS backend details', () => {
    const options = {
      backend: { kind: BackendTypes.NESTJS },
      nestModule: 'my-module',
      controllerName: 'my-controller',
    } as any;

    PrintAngularOptions('my-schematic', options);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Backend: NESTJS'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Nest Module: my-module'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Controller Name: my-controller'));
  });

  it('should log NONE context and backend', () => {
    const options = {
      backend: { kind: BackendTypes.NONE },
    } as any;

    PrintAngularOptions('my-schematic', options);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Context: \x1b[31mNONE\x1b[0m'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Backend: NONE'));
  });
});
