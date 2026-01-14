import { NormalizeAngularOptions, AssertAngularOptionsNameProperty } from './angular-options';
import { NormalizeGlobalOptions } from '@rxap/schematics-utilities';
import { NormalizeBackendOptions } from './backend/backend-options';
import { BackendTypes } from './backend/backend-types';

jest.mock('@rxap/schematics-utilities', () => ({
  NormalizeGlobalOptions: jest.fn((options) => ({ ...options, normalizedGlobal: true })),
}));

jest.mock('./backend/backend-options', () => ({
  NormalizeBackendOptions: jest.fn((backend) => ({ kind: backend, normalizedBackend: true })),
}));

describe('AngularOptions Utilities', () => {
  describe('NormalizeAngularOptions', () => {
    it('should normalize angular options with default shared=false', () => {
      const options = { project: 'my-project' };
      const result = NormalizeAngularOptions(options);

      expect(NormalizeGlobalOptions).toHaveBeenCalled();
      expect(result.shared).toBe(false);
      expect(result.project).toBe('my-project');
      expect(result.backend.kind).toBe(BackendTypes.NONE);
    });

    it('should set shared=true if project is "shared"', () => {
      const options = { project: 'shared' };
      const result = NormalizeAngularOptions(options);
      expect(result.shared).toBe(true);
    });

    it('should dasherize string options', () => {
      const options = {
        project: 'my-project',
        componentName: 'MyComponent',
        name: 'MyName',
        context: 'MyContext',
        nestModule: 'MyModule',
        controllerName: 'MyController',
      };
      const result = NormalizeAngularOptions(options);

      expect(result.componentName).toBe('my-component');
      expect(result.name).toBe('my-name');
      expect(result.context).toBe('my-context');
      expect(result.nestModule).toBe('my-module');
      expect(result.controllerName).toBe('my-controller');
    });

    it('should use module from backend if nestModule is missing and backend is NESTJS', () => {
       (NormalizeBackendOptions as jest.Mock).mockReturnValueOnce({
         kind: BackendTypes.NESTJS,
         module: 'BackendModule'
       });
       const result = NormalizeAngularOptions({ project: 'my-project', backend: BackendTypes.NESTJS });
       expect(result.nestModule).toBe('backend-module');
    });
  });

  describe('AssertAngularOptionsNameProperty', () => {
    it('should not throw if name is present', () => {
      expect(() => AssertAngularOptionsNameProperty({ name: 'test' } as any)).not.toThrow();
    });

    it('should throw if name is missing', () => {
      expect(() => AssertAngularOptionsNameProperty({ name: null } as any)).toThrow('The name option is required');
    });
  });
});
