import { InjectScopeInFilePath } from './file-with-scope';

describe('FileWithScope', () => {

  describe('InjectScopeInFilePath', () => {

    it('should add scope to file path without extension', () => {

      expect(InjectScopeInFilePath('path/to/file', 'scope')).toBe('path/to/file.scope');

    });

    it('should add scope to file path with extension', () => {

      expect(InjectScopeInFilePath('path/to/file.ts', 'scope')).toBe('path/to/file.scope.ts');

    });

    it('should add scope to file path with scope', () => {

      expect(InjectScopeInFilePath('path/to/file.scope.ts', 'scope')).toBe('path/to/file.scope.scope.ts');

    });

  });

});
