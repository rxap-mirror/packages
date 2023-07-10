import {Project, PropertyAssignment, Writers} from 'ts-morph';
import {GetNestModuleMetadata} from './get-nest-module-metadata';
import {AddNestModuleImport} from './add-nest-module-import';

describe('@rxap/schematics-ts-morph', () => {

  describe('nest', () => {

    describe('AddNestModuleImport', () => {

      it('should add module import', () => {

        const project = new Project({useInMemoryFileSystem: true});

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

        AddNestModuleImport(sourceFile, 'TestModule');

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule]');


      });

      it('should add module import with writer function', () => {

        const project = new Project({useInMemoryFileSystem: true});

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

        AddNestModuleImport(sourceFile, 'TestModule', [], w => {
          w.write('TestModule')
          w.write('.forRoot()')
        });

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule.forRoot()]');


      });

      it('should not overwrite module import', () => {

        const project = new Project({useInMemoryFileSystem: true});

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({imports: '[TestModule]'})],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        AddNestModuleImport(sourceFile, 'TestModule');

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule]');

      });

      it('should overwrite module import', () => {

        const project = new Project({useInMemoryFileSystem: true});

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({imports: '[TestModule]'})],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        AddNestModuleImport(sourceFile, 'TestModule', [], undefined, true);

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule]');

      });

      it('should not overwrite module import with writer function', () => {

        const project = new Project({useInMemoryFileSystem: true});

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({
                imports: '[TestModule.forRoot()]',
              })],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        AddNestModuleImport(sourceFile, 'TestModule', [], w => {
          w.write('TestModule')
          w.write('.forRoot({ test: true })')
        });

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule.forRoot()]');


      });

      it('should not overwrite module import with writer function', () => {

        const project = new Project({useInMemoryFileSystem: true});

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [Writers.object({
                imports: '[TestModule.forRoot()]',
              })],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: ['Module'],
          moduleSpecifier: '@nestjs/common',
        });

        AddNestModuleImport(sourceFile, 'TestModule', [], w => {
          w.write('TestModule')
          w.write('.forRoot({ test: true })')
        }, true);

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim()).toEqual('[TestModule.forRoot({ test: true })]');


      });

    });

  });

});
