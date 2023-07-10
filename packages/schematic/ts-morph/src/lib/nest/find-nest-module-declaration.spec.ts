import {
  Project,
  Writers,
} from 'ts-morph';
import { FindNestModuleDeclaration } from './find-nest-module-declaration';

describe('@rxap/schematics-ts-morph', () => {

  describe('nest', () => {

    describe('FindNestjsModuleDeclaration', () => {

      it('should find declaration', () => {

        const project = new Project({ useInMemoryFileSystem: true });

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({})],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        expect(FindNestModuleDeclaration(project)).not.toBeUndefined();

      });

      it('should find sourceFile in directory', () => {

        const project = new Project({useInMemoryFileSystem: true});

        const sourceFile0 = project.createSourceFile('my.module.ts');

        sourceFile0.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({})],
            },
          ],
        });

        sourceFile0.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        const declaration0 = FindNestModuleDeclaration(project, '/');
        expect(declaration0).not.toBeUndefined();
        expect(declaration0?.getName()).toEqual('MyModule');

        const sourceFile1 = project.createSourceFile('/sub/dir/my.module.ts');

        sourceFile1.addClass({
          isExported: true,
          name: 'SubMyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({})],
            },
          ],
        });

        sourceFile1.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        const declaration1 = FindNestModuleDeclaration(project, '/sub/dir');
        expect(declaration1).not.toBeUndefined();
        expect(declaration1?.getName()).toEqual('SubMyModule');

      });

    });

  });

});
