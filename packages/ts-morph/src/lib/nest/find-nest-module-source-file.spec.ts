import {
  Project,
  Writers,
} from 'ts-morph';
import { FindNestModuleSourceFile } from './find-nest-module-source-file';

describe('@rxap/schematics-ts-morph', () => {

  describe('nest', () => {

    describe('FindNestjsModuleSourceFile', () => {

      it('should find sourceFile', () => {

        const project = new Project({ useInMemoryFileSystem: true });

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [ Writers.object({}) ],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: [ 'Module' ],
          moduleSpecifier: '@nestjs/common',
        });

        expect(FindNestModuleSourceFile(project)).not.toBeUndefined();

      });

      it('should find sourceFile in directory', () => {

        const project = new Project({ useInMemoryFileSystem: true });

        const sourceFile0 = project.createSourceFile('my.module.ts');

        sourceFile0.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [ Writers.object({}) ],
            },
          ],
        });

        sourceFile0.addImportDeclaration({
          namedImports: [ 'Module' ],
          moduleSpecifier: '@nestjs/common',
        });

        const findSourceFile0 = FindNestModuleSourceFile(project, '/');
        expect(findSourceFile0).not.toBeUndefined();
        expect(findSourceFile0?.getFilePath()).toEqual('/my.module.ts');

        const sourceFile1 = project.createSourceFile('/sub/dir/my.module.ts');

        sourceFile1.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [ Writers.object({}) ],
            },
          ],
        });

        sourceFile1.addImportDeclaration({
          namedImports: [ 'Module' ],
          moduleSpecifier: '@nestjs/common',
        });

        const findSourceFile1 = FindNestModuleSourceFile(project, '/sub/dir');
        expect(findSourceFile1).not.toBeUndefined();
        expect(findSourceFile1?.getFilePath()).toEqual('/sub/dir/my.module.ts');

      });

    });

  });

});
